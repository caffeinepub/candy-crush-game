import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    username: string;
    score: bigint;
    snake?: Snake;
}
export interface GameSnapshot {
    timer: bigint;
    food: Coordinate;
    worldSize: Coordinate;
    snacks: Array<Coordinate>;
    snakes: Array<Snake>;
    timeRemaining: bigint;
}
export interface Snake {
    direction: Direction;
    body: Array<Coordinate>;
    score: bigint;
}
export interface MultiplayerRoom {
    lastStateUpdateTimestamp: {
        __kind__: "Stopped";
        Stopped: null;
    } | {
        __kind__: "InProgress";
        InProgress: bigint;
    };
    isActive: boolean;
    currentTime: bigint;
    players: Array<[string, string]>;
    roomId: string;
    worldState: GameSnapshot;
}
export interface Coordinate {
    x: bigint;
    y: bigint;
}
export interface GameState {
    coinBalance: bigint;
    dailyClaimHistory: Array<string>;
    upgradeLevels: bigint;
    unlockedVehicles: Array<string>;
}
export interface UserProfile {
    username: string;
    gameState: GameState;
}
export enum Direction {
    Up = "Up",
    Down = "Down",
    Left = "Left",
    Right = "Right"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkRoomExists(roomId: string): Promise<boolean>;
    createRoom(username: string): Promise<string>;
    getAllRooms(): Promise<Array<[string, MultiplayerRoom]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGameState(): Promise<GameState>;
    getRoomParticipants(roomId: string): Promise<Array<Player>>;
    getRoomState(roomId: string): Promise<MultiplayerRoom | null>;
    getState(_roomId: string): Promise<GameSnapshot>;
    getTimeRemaining(_roomId: string): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinRoom(roomId: string, playerName: string): Promise<{
        __kind__: "AlreadyJoined";
        AlreadyJoined: null;
    } | {
        __kind__: "Success";
        Success: GameSnapshot;
    } | {
        __kind__: "RoomNotFoundOrInactive";
        RoomNotFoundOrInactive: null;
    }>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveGameState(state: GameState): Promise<void>;
    toggleTimer(roomId: string): Promise<boolean>;
}
