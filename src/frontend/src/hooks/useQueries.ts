import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type DailyStats,
  type DietRecommendation,
  DietType,
  DifficultyLevel,
  type Exercise,
  FitnessGoal,
  type Notification,
  type UserProfile,
  type WeightEntry,
  WorkoutCategory,
  type WorkoutLog,
  type WorkoutPlan,
} from "../backend.d";
import { useActor } from "./useActor";

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// ──────────────────────────────────────────────────
// User Profile
// ──────────────────────────────────────────────────

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

// ──────────────────────────────────────────────────
// Daily Stats
// ──────────────────────────────────────────────────

export function useDailyStats(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<DailyStats>({
    queryKey: ["dailyStats", date],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getCallerDailyStats(date);
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUpdateDailyStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      steps,
      water,
    }: {
      date: string;
      steps: bigint;
      water: bigint;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addOrUpdateCallerDailyStats(date, steps, water);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["dailyStats", variables.date],
      });
    },
  });
}

// ──────────────────────────────────────────────────
// Workout Logs
// ──────────────────────────────────────────────────

export function useWorkoutLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<WorkoutLog[]>({
    queryKey: ["workoutLogs"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getCallerWorkoutLogs();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useLogWorkout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      exercise,
      duration,
      calories,
      date,
    }: {
      category: WorkoutCategory;
      exercise: string;
      duration: bigint;
      calories: bigint;
      date: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.logWorkout(category, exercise, duration, calories, date);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
      void queryClient.invalidateQueries({ queryKey: ["dailyStats"] });
    },
  });
}

export function useDeleteWorkoutLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteWorkoutLog(logId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workoutLogs"] });
    },
  });
}

// ──────────────────────────────────────────────────
// Exercises
// ──────────────────────────────────────────────────

export function useExercisesByCategory(category: WorkoutCategory | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Exercise[]>({
    queryKey: ["exercises", category],
    queryFn: async () => {
      if (!actor || !category) throw new Error("Actor or category missing");
      return actor.getExercisesByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
    retry: false,
  });
}

export function useCreateExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      category: WorkoutCategory;
      name: string;
      description: string;
      setsRec: bigint;
      repsRec: bigint;
      restSecs: bigint;
      difficulty: DifficultyLevel;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createExercise(
        params.category,
        params.name,
        params.description,
        params.setsRec,
        params.repsRec,
        params.restSecs,
        params.difficulty,
        null,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

export function useDeleteExercise() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (exerciseId: bigint) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.deleteExercise(exerciseId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
  });
}

// ──────────────────────────────────────────────────
// Workout Plan
// ──────────────────────────────────────────────────

export function useWorkoutPlan() {
  const { actor, isFetching } = useActor();
  return useQuery<WorkoutPlan>({
    queryKey: ["workoutPlan"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getCallerWorkoutPlan();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveWorkoutPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      goal,
      difficulty,
      planJson,
    }: {
      goal: FitnessGoal;
      difficulty: DifficultyLevel;
      planJson: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.saveCallerWorkoutPlan(goal, difficulty, planJson);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workoutPlan"] });
    },
  });
}

// ──────────────────────────────────────────────────
// Diet Recommendation
// ──────────────────────────────────────────────────

export function useDietRecommendation() {
  const { actor, isFetching } = useActor();
  return useQuery<DietRecommendation>({
    queryKey: ["dietRecommendation"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getCallerDietRecommendation();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useSaveDietRecommendation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dietType,
      dailyCalories,
      planJson,
    }: {
      dietType: DietType;
      dailyCalories: bigint;
      planJson: string;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.saveCallerDietRecommendation(
        dietType,
        dailyCalories,
        planJson,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dietRecommendation"] });
    },
  });
}

// ──────────────────────────────────────────────────
// Weight Entries
// ──────────────────────────────────────────────────

export function useWeightEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<WeightEntry[]>({
    queryKey: ["weightEntries"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getCallerWeightEntries();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddWeightEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      weightKg,
      date,
    }: { weightKg: number; date: string }) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.addCallerWeightEntry(weightKg, date);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["weightEntries"] });
    },
  });
}

// ──────────────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────────────

export function useNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.getLatestNotifications();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useCreateNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error("Actor not initialized");
      return actor.createNotification(message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// ──────────────────────────────────────────────────
// Admin
// ──────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAllUserProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUserCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["userCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUserCount();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export { DietType, DifficultyLevel, FitnessGoal, WorkoutCategory };
