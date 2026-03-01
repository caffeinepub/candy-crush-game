import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface CoinDrop {
    value: bigint;
    timeRemaining: bigint;
    position: Coordinate;
}
export interface UserProfile {
    username: string;
    gameState: GameState;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addRandomPointsToRoom(roomId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createRoom(username: string): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    onSnakeDeath(_roomId: string, body: Array<Coordinate>, snakeSize: bigint): Promise<Array<CoinDrop>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
