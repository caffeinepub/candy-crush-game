import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  public type GameSnapshot = {
    snakes : [Snake];
    snacks : [Coordinate];
    timer : Int;
    timeRemaining : Int;
    food : Coordinate;
    worldSize : Coordinate;
  };

  public type MultiplayerRoom = {
    roomId : Text;
    players : [(Text, Text)];
    worldState : GameSnapshot;
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

  let rooms = Map.empty<Text, MultiplayerRoom>();
  let playerRooms = Map.empty<Text, Map.Map<Text, Player>>();
  let roomCodes = List.empty<Text>();

  // Store game state by Principal instead of username
  let gameState = Map.empty<Principal, GameState>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var timeRemaining = 100;
  var activeRoomId : ?Text = null;
  var currentRoomNumber = 0;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    // Also update the game state separately for backward compatibility
    gameState.add(caller, profile.gameState);
  };

  // Game State Management - tied to caller's Principal
  public query ({ caller }) func getGameState() : async GameState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access game state");
    };
    switch (gameState.get(caller)) {
      case (null) {
        // Return default state for new users
        {
          coinBalance = 0;
          unlockedVehicles = [];
          upgradeLevels = 0;
          dailyClaimHistory = [];
        };
      };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func saveGameState(state : GameState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save game state");
    };
    gameState.add(caller, state);
  };

  // Room Management - requires user authentication
  public shared ({ caller }) func createRoom(username : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create rooms");
    };

    await clearInactiveRooms();

    activeRoomId := null;
    currentRoomNumber += 1 : Nat;
    let roomId = currentRoomNumber.toText();

    let room : MultiplayerRoom = {
      roomId;
      players = [];
      worldState = {
        snakes = [];
        snacks = [];
        timer = 0;
        timeRemaining = 0;
        food = { x = 0; y = 0 };
        worldSize = { x = 0; y = 0 };
      };
      currentTime = 0;
      lastStateUpdateTimestamp = #Stopped;
      isActive = true;
    };

    rooms.add(roomId, room);
    roomCodes.clear();
    for ((id, _room) in rooms.entries()) {
      if (_room.isActive) {
        roomCodes.add(id);
      };
    };

    let code = "MP-" # roomId;
    code;
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

  public shared ({ caller }) func toggleTimer(roomId : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle timer");
    };

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist!") };
      case (?room) {
        switch (room.lastStateUpdateTimestamp) {
          case (#Stopped) {
            let updatedRoom = {
              room with
              lastStateUpdateTimestamp = #InProgress(Time.now());
            };
            rooms.add(roomId, updatedRoom);
            true;
          };
          case (#InProgress(_)) {
            let updatedRoom = {
              room with
              lastStateUpdateTimestamp = #Stopped;
            };
            rooms.add(roomId, updatedRoom);
            false;
          };
        };
      };
    };
  };

  // Public query - anyone can check if room exists (needed for joining)
  public query ({ caller }) func checkRoomExists(roomId : Text) : async Bool {
    switch (rooms.get(roomId)) {
      case (null) { false };
      case (?room) { room.isActive };
    };
  };

  func gameLoop(roomId : Text, speed : Int) : async () {
    let currentTime = Time.now();

    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        switch (room.lastStateUpdateTimestamp) {
          case (#Stopped) { Runtime.trap("Game is not running!") };
          case (#InProgress(lastUpdateTime)) {
            if (currentTime - lastUpdateTime >= speed * 1000000) {
              let updatedRoom = {
                room with
                worldState = {
                  room.worldState with
                  timeRemaining = room.worldState.timeRemaining - 1 : Int;
                };
                lastStateUpdateTimestamp = #InProgress(currentTime);
              };
              rooms.add(roomId, updatedRoom);
            };
          };
        };
      };
    };
  };

  // Public query - game state information
  public query ({ caller }) func getTimeRemaining(_roomId : Text) : async Nat {
    timeRemaining;
  };

  // Public query - anyone can view room state (needed for multiplayer)
  public query ({ caller }) func getRoomState(roomId : Text) : async ?MultiplayerRoom {
    switch (rooms.get(roomId)) {
      case (null) { null };
      case (?room) { ?room };
    };
  };

  // Public query - game state information
  public query ({ caller }) func getState(_roomId : Text) : async GameSnapshot {
    {
      snakes = [];
      snacks = [];
      timer = 0;
      timeRemaining = 0;
      food = { x = 0; y = 0 };
      worldSize = { x = 0; y = 0 };
    };
  };

  public shared ({ caller }) func joinRoom(roomId : Text, playerName : Text) : async {
    #Success : GameSnapshot;
    #AlreadyJoined;
    #RoomNotFoundOrInactive;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can join rooms");
    };

    switch (rooms.get(roomId)) {
      case (null) { #RoomNotFoundOrInactive };
      case (?room) {
        if (not room.isActive) { return #RoomNotFoundOrInactive };

        let existingPlayers = playerRooms.get(roomId);

        switch (existingPlayers) {
          case (null) {
            let newPlayerMap = Map.empty<Text, Player>();
            let newPlayer : Player = {
              username = playerName;
              score = 0;
              snake = ?{
                body = [{ x = 0; y = 0 }];
                direction = #Up;
                score = 0;
              };
            };
            newPlayerMap.add(playerName, newPlayer);
            playerRooms.add(roomId, newPlayerMap);
            #Success(room.worldState);
          };
          case (?players) {
            if (players.containsKey(playerName)) {
              #AlreadyJoined;
            } else {
              let newPlayer : Player = {
                username = playerName;
                score = 0;
                snake = ?{
                  body = [{ x = 0; y = 0 }];
                  direction = #Up;
                  score = 0;
                };
              };
              players.add(playerName, newPlayer);
              #Success(room.worldState);
            };
          };
        };
      };
    };
  };

  // Public query - anyone can view available rooms (needed for multiplayer lobby)
  public query ({ caller }) func getAllRooms() : async [(Text, MultiplayerRoom)] {
    rooms.toArray();
  };

  // Public query - anyone can view room participants (needed for multiplayer)
  public query ({ caller }) func getRoomParticipants(roomId : Text) : async [Player] {
    switch (playerRooms.get(roomId)) {
      case (null) { [] };
      case (?players) {
        let playerValues = players.values().toArray();
        playerValues;
      };
    };
  };
};
