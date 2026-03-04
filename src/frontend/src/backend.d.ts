import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Exercise {
    id: bigint;
    difficultyLevel: DifficultyLevel;
    restSeconds: bigint;
    setsRecommended: bigint;
    name: string;
    description: string;
    repsRecommended: bigint;
    imageUrl?: ExternalBlob;
    category: WorkoutCategory;
}
export interface DietRecommendation {
    dailyCaloriesRequired: bigint;
    createdAt: Time;
    dietType: DietType;
    planJson: string;
}
export interface WorkoutLog {
    id: bigint;
    date: string;
    durationMinutes: bigint;
    exerciseName: string;
    category: WorkoutCategory;
    caloriesBurned: bigint;
}
export type Time = bigint;
export interface DailyStats {
    waterIntakeMl: bigint;
    date: string;
    stepsCount: bigint;
}
export interface WorkoutPlan {
    difficultyLevel: DifficultyLevel;
    goal: FitnessGoal;
    createdAt: Time;
    planJson: string;
}
export interface Notification {
    id: bigint;
    createdAt: Time;
    message: string;
}
export interface WeightEntry {
    id: bigint;
    date: string;
    weightKg: number;
}
export interface UserProfile {
    age: bigint;
    fitnessGoal: FitnessGoal;
    heightCm: bigint;
    name: string;
    weightKg: number;
    gender: Gender;
}
export enum DietType {
    veg = "veg",
    nonVeg = "nonVeg"
}
export enum DifficultyLevel {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export enum FitnessGoal {
    weightLoss = "weightLoss",
    muscleGain = "muscleGain",
    maintainFitness = "maintainFitness"
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WorkoutCategory {
    abs = "abs",
    custom = "custom",
    back = "back",
    chest = "chest",
    legs = "legs",
    cardio = "cardio"
}
export interface backendInterface {
    addCallerWeightEntry(weightKg: number, date: string): Promise<void>;
    addOrUpdateCallerDailyStats(date: string, steps: bigint, water: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createExercise(category: WorkoutCategory, name: string, description: string, setsRec: bigint, repsRec: bigint, restSecs: bigint, difficulty: DifficultyLevel, imageUrl: ExternalBlob | null): Promise<void>;
    createNotification(message: string): Promise<void>;
    deleteExercise(exerciseId: bigint): Promise<void>;
    deleteWorkoutLog(logId: bigint): Promise<void>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerDailyStats(date: string): Promise<DailyStats>;
    getCallerDietRecommendation(): Promise<DietRecommendation>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerWeightEntries(): Promise<Array<WeightEntry>>;
    getCallerWorkoutLogs(): Promise<Array<WorkoutLog>>;
    getCallerWorkoutPlan(): Promise<WorkoutPlan>;
    getExercisesByCategory(category: WorkoutCategory): Promise<Array<Exercise>>;
    getLatestNotifications(): Promise<Array<Notification>>;
    getUserCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    isCallerAdmin(): Promise<boolean>;
    logWorkout(category: WorkoutCategory, exercise: string, duration: bigint, calories: bigint, date: string): Promise<void>;
    saveCallerDietRecommendation(dietType: DietType, dailyCalories: bigint, planJson: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCallerWorkoutPlan(goal: FitnessGoal, difficulty: DifficultyLevel, planJson: string): Promise<void>;
    updateExercise(exercise: Exercise): Promise<void>;
}
