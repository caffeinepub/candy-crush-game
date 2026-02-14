import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Iter "mo:core/Iter";



actor {
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

  let rooms = Map.empty<Text, MultiplayerRoom>();
  let playerRooms = Map.empty<Text, Map.Map<Text, Player>>();
  let roomCodes = List.empty<Text>();

  var timeRemaining = 100;
  var activeRoomId : ?Text = null;
  var currentRoomNumber = 0;

  public shared ({ caller }) func createRoom(username : Text) : async Text {
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

  public query ({ caller }) func getTimeRemaining(_roomId : Text) : async Nat {
    timeRemaining;
  };

  public query ({ caller }) func getRoomState(roomId : Text) : async ?MultiplayerRoom {
    switch (rooms.get(roomId)) {
      case (null) { null };
      case (?room) { ?room };
    };
  };

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

  public query ({ caller }) func getAllRooms() : async [(Text, MultiplayerRoom)] {
    rooms.toArray();
  };

  public query ({ caller }) func containsText(times : Nat) : async Text {
    var result = "";
    for (i in Nat.range(0, times)) {
      result #= "Contains";
    };
    result;
  };

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
