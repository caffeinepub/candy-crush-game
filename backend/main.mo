import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Principal "mo:core/Principal";


import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration for persistent state changes

actor {
  // Initialize the access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type Coordinate = {
    x : Nat;
    y : Nat;
  };

  public type Player = {
    username : Text;
    score : Nat;
    snake : ?Snake;
  };

  public type Snake = {
    body : [Coordinate];
    direction : Direction;
    score : Nat;
  };

  public type Direction = {
    #Up;
    #Down;
    #Left;
    #Right;
  };

  public type MultiplayerRoom = {
    roomId : Text;
    players : [(Text, Text)];
    worldState : {
      snakes : [Snake];
      snacks : [Coordinate];
      timer : Int;
      timeRemaining : Int;
      food : Coordinate;
      worldSize : Coordinate;
      colorPoints : [ColorPoint];
      coinDrops : [CoinDrop];
    };
    currentTime : Int;
    lastStateUpdateTimestamp : {
      #Stopped;
      #InProgress : Int;
    };
    isActive : Bool;
  };

  public type GameState = {
    coinBalance : Nat;
    unlockedVehicles : [Text];
    upgradeLevels : Nat;
    dailyClaimHistory : [Text];
  };

  public type UserProfile = {
    username : Text;
    gameState : GameState;
  };

  public type ColorPoint = {
    position : Coordinate;
    pointType : {
      #red;
      #green;
      #blue;
    };
  };

  public type CoinDrop = {
    position : Coordinate;
    value : Nat;
    timeRemaining : Int;
  };

  let rooms = Map.empty<Text, MultiplayerRoom>();
  let playerRooms = Map.empty<Text, Map.Map<Text, Player>>();
  let gameState = Map.empty<Principal, GameState>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var roomCodes = List.empty<Text>();

  var timeRemaining = 100;
  var activeRoomId : ?Text = null;
  var currentRoomNumber = 0;

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUser(caller);
    userProfiles.add(caller, profile);
  };

  // Room management
  public shared ({ caller }) func createRoom(username : Text) : async Text {
    checkUser(caller);

    await clearInactiveRooms();
    activeRoomId := null;
    currentRoomNumber += 1 : Nat;
    let roomId = currentRoomNumber.toText();

    let newRoom = {
      roomId;
      players = [];
      worldState = {
        snakes = [];
        snacks = [];
        timer = 0;
        timeRemaining = 0;
        food = { x = 0; y = 0 };
        worldSize = { x = 0; y = 0 };
        colorPoints = [];
        coinDrops = [];
      };
      currentTime = 0;
      lastStateUpdateTimestamp = #Stopped;
      isActive = true;
    };

    rooms.add(roomId, newRoom);

    roomCodes.clear();
    for ((id, _room) in rooms.entries()) {
      if (_room.isActive) {
        roomCodes.add(id);
      };
    };
    "MP-" # roomId;
  };

  // Coin drop logic for snake deaths
  public shared ({ caller }) func onSnakeDeath(_roomId : Text, body : [Coordinate], snakeSize : Nat) : async [CoinDrop] {
    checkUser(caller);

    let coinDropConfigs = List.empty<CoinDrop>();
    let baseRadius = Nat.min(snakeSize / 4, 10);
    let coinsToGenerate = Nat.min((body.size() * 15) / 100, 200);

    var coinsLeft = coinsToGenerate;

    for (position in body.values()) {
      let isPoint = false; // Switch to random bool
      var multiplier = 1;

      var radius = baseRadius;
      while (coinsLeft > 0 and radius > 0) {
        if (isPoint) {
          multiplier := (baseRadius - radius + 1) * 2;
        };
        if (coinsLeft > 0) {
          let coinDrop = {
            position;
            value = multiplier;
            timeRemaining = snakeSize * 2;
          };
          coinsLeft -= 1;
          coinDropConfigs.add(coinDrop);
        };
        radius -= 1;
      };
    };

    coinDropConfigs.toArray();
  };

  func clearInactiveRooms() : async () {
    let currentTime = Time.now();
    let inactivationTime = 15_000_000_000;
    for ((roomId, room) in rooms.entries()) {
      if (room.isActive) {
        let lastUpdate = switch (room.lastStateUpdateTimestamp) {
          case (#Stopped) { 0 };
          case (#InProgress(timestamp)) { timestamp };
        };

        if (lastUpdate != 0 and currentTime - lastUpdate > inactivationTime) {
          let inactivatedRoom = { room with isActive = false };
          rooms.add(roomId, inactivatedRoom);
        };
      };
    };
  };

  // Color point generation
  public shared ({ caller }) func addRandomPointsToRoom(roomId : Text) : async () {
    checkUser(caller);

    switch (rooms.get(roomId)) {
      case (null) { () };
      case (?room) {
        let points = generateRandomColorPoints();
        let newWorldState = {
          room.worldState with colorPoints = points;
        };
        let newRoom = { room with worldState = newWorldState };
        rooms.add(roomId, newRoom);
      };
    };
  };

  func generateRandomColorPoints() : [ColorPoint] {
    // TODO: Switch to cryptographic randomness
    let red = {
      pointType = #red;
      position = getRandomPosition();
    };
    let green = {
      pointType = #green;
      position = getRandomPosition();
    };
    let blue = {
      pointType = #blue;
      position = getRandomPosition();
    };
    [red, green, blue];
  };

  func getRandomPosition() : Coordinate {
    // TODO: Replace with actual randomness
    let x = 0;
    let y = 0;
    { x; y };
  };

  // Access control check helper
  func checkUser(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };
};

