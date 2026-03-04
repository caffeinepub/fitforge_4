import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calculator,
  CheckCircle2,
  ChevronLeft,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Timer,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DifficultyLevel, WorkoutCategory } from "../backend.d";
import type { Exercise } from "../backend.d";
import {
  useExercisesByCategory,
  useLogWorkout,
  useUserProfile,
} from "../hooks/useQueries";
import { getTodayDate } from "../hooks/useQueries";
import { calculateBMI, calculateCalories } from "../lib/workoutTemplates";

// ──────────────────────────────────────────────────
// Category data
// ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: WorkoutCategory.chest, label: "Chest", emoji: "🏋️", color: "#ff6b6b" },
  { id: WorkoutCategory.back, label: "Back", emoji: "🎯", color: "#4ecdc4" },
  { id: WorkoutCategory.legs, label: "Legs", emoji: "🦵", color: "#a78bfa" },
  {
    id: WorkoutCategory.cardio,
    label: "Cardio",
    emoji: "🏃",
    color: "#39FF14",
  },
  { id: WorkoutCategory.abs, label: "Abs", emoji: "🔥", color: "#f59e0b" },
  {
    id: WorkoutCategory.custom,
    label: "Custom",
    emoji: "⚡",
    color: "#60a5fa",
  },
];

const CAT_OCID: Record<WorkoutCategory, string> = {
  [WorkoutCategory.chest]: "workouts.chest.card",
  [WorkoutCategory.back]: "workouts.back.card",
  [WorkoutCategory.legs]: "workouts.legs.card",
  [WorkoutCategory.cardio]: "workouts.cardio.card",
  [WorkoutCategory.abs]: "workouts.abs.card",
  [WorkoutCategory.custom]: "workouts.custom.card",
};

const DIFF_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.beginner]: "#39FF14",
  [DifficultyLevel.intermediate]: "#f59e0b",
  [DifficultyLevel.advanced]: "#ef4444",
};

// ──────────────────────────────────────────────────
// Workout Detail with Timer
// ──────────────────────────────────────────────────
interface WorkoutDetailProps {
  exercise: Exercise;
  onBack: () => void;
  userWeight: number;
}

function WorkoutDetail({ exercise, onBack, userWeight }: WorkoutDetailProps) {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logWorkout = useLogWorkout();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleComplete = async () => {
    const durationMin = Math.max(1, Math.floor(timerSeconds / 60));
    const cals = calculateCalories(userWeight || 70, durationMin);
    try {
      await logWorkout.mutateAsync({
        category: exercise.category,
        exercise: exercise.name,
        duration: BigInt(durationMin),
        calories: BigInt(cals),
        date: getTodayDate(),
      });
      setCompleted(true);
      setIsRunning(false);
      toast.success(`Workout logged! ${cals} kcal burned 🔥`);
    } catch {
      toast.error("Failed to log workout");
    }
  };

  return (
    <motion.div
      data-ocid="workout_detail.page"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="min-h-screen"
      style={{ background: "oklch(0.08 0 0)" }}
    >
      {/* Header */}
      <div className="px-4 pt-10 pb-4 flex items-center gap-3">
        <button
          type="button"
          data-ocid="workout_detail.back.button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.14 0 0)" }}
        >
          <ChevronLeft size={20} />
        </button>
        <h1
          className="text-lg font-bold flex-1 truncate"
          style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
        >
          {exercise.name}
        </h1>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{
            background: `${DIFF_COLORS[exercise.difficultyLevel]}18`,
            color: DIFF_COLORS[exercise.difficultyLevel],
            border: `1px solid ${DIFF_COLORS[exercise.difficultyLevel]}40`,
          }}
        >
          {exercise.difficultyLevel}
        </span>
      </div>

      <div className="px-4 space-y-4">
        {/* Exercise info */}
        <div
          className="p-4 rounded-2xl"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.20 0 0)",
          }}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            {exercise.description ||
              "A great exercise to build strength and endurance."}
          </p>
          <div className="flex gap-3 mt-3">
            {[
              { label: "Sets", value: String(exercise.setsRecommended) },
              { label: "Reps", value: String(exercise.repsRecommended) },
              { label: "Rest", value: `${exercise.restSeconds}s` },
            ].map((chip) => (
              <div
                key={chip.label}
                className="flex-1 p-2 rounded-xl text-center"
                style={{ background: "oklch(0.16 0 0)" }}
              >
                <p className="text-xs text-muted-foreground">{chip.label}</p>
                <p className="text-base font-bold neon-text">{chip.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div
          className="p-6 rounded-2xl text-center"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.87 0.31 140 / 0.25)",
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
            <Timer size={12} />
            Workout Timer
          </p>
          <div
            className="timer-display text-6xl font-bold mb-4"
            style={{
              color: isRunning ? "oklch(0.87 0.31 140)" : "oklch(0.90 0 0)",
            }}
          >
            {formatTime(timerSeconds)}
          </div>
          <div className="flex gap-3 justify-center">
            {!isRunning ? (
              <button
                type="button"
                data-ocid="workout_detail.timer_start.button"
                onClick={() => setIsRunning(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm"
                style={{
                  background: "oklch(0.87 0.31 140)",
                  color: "oklch(0.06 0 0)",
                  boxShadow: "0 0 16px oklch(0.87 0.31 140 / 0.4)",
                }}
              >
                <Play size={16} />
                {timerSeconds === 0 ? "Start" : "Resume"}
              </button>
            ) : (
              <button
                type="button"
                data-ocid="workout_detail.timer_pause.button"
                onClick={() => setIsRunning(false)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm"
                style={{
                  background: "oklch(0.20 0 0)",
                  border: "1px solid oklch(0.87 0.31 140 / 0.4)",
                  color: "oklch(0.87 0.31 140)",
                }}
              >
                <Pause size={16} />
                Pause
              </button>
            )}
            <button
              type="button"
              data-ocid="workout_detail.timer_reset.button"
              onClick={() => {
                setIsRunning(false);
                setTimerSeconds(0);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm"
              style={{
                background: "oklch(0.16 0 0)",
                border: "1px solid oklch(0.22 0 0)",
                color: "oklch(0.55 0 0)",
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Complete button */}
        {!completed ? (
          <Button
            data-ocid="workout_detail.complete.button"
            onClick={handleComplete}
            disabled={logWorkout.isPending || timerSeconds === 0}
            className="w-full h-14 rounded-2xl text-base font-bold"
            style={{
              background:
                timerSeconds > 0 ? "oklch(0.87 0.31 140)" : "oklch(0.18 0 0)",
              color: timerSeconds > 0 ? "oklch(0.06 0 0)" : "oklch(0.40 0 0)",
            }}
          >
            {logWorkout.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Logging...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                Mark as Completed
              </span>
            )}
          </Button>
        ) : (
          <div
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-bold text-base"
            style={{
              background: "oklch(0.87 0.31 140 / 0.15)",
              border: "1px solid oklch(0.87 0.31 140 / 0.4)",
              color: "oklch(0.87 0.31 140)",
            }}
          >
            <CheckCircle2 size={18} />
            Workout Completed! 🎉
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────
// Exercise List
// ──────────────────────────────────────────────────
interface ExerciseListProps {
  category: WorkoutCategory;
  categoryLabel: string;
  categoryColor: string;
  onBack: () => void;
  onSelectExercise: (ex: Exercise) => void;
  userWeight: number;
}

function ExerciseList({
  category,
  categoryLabel,
  categoryColor,
  onBack,
  onSelectExercise,
}: ExerciseListProps) {
  const { data: exercises = [], isLoading } = useExercisesByCategory(category);

  // Fallback exercises if none from backend
  const FALLBACK: Record<WorkoutCategory, Exercise[]> = {
    [WorkoutCategory.chest]: [
      {
        id: BigInt(1),
        name: "Bench Press",
        category,
        difficultyLevel: DifficultyLevel.intermediate,
        description:
          "Classic chest builder. Lie on bench, grip bar wide, lower to chest.",
        setsRecommended: BigInt(4),
        repsRecommended: BigInt(8),
        restSeconds: BigInt(90),
      },
      {
        id: BigInt(2),
        name: "Push-ups",
        category,
        difficultyLevel: DifficultyLevel.beginner,
        description:
          "Bodyweight chest exercise. Keep body straight, lower chest to floor.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(15),
        restSeconds: BigInt(60),
      },
      {
        id: BigInt(3),
        name: "Cable Flyes",
        category,
        difficultyLevel: DifficultyLevel.intermediate,
        description:
          "Isolation exercise for chest. Keep slight bend in elbows throughout.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(12),
        restSeconds: BigInt(60),
      },
    ],
    [WorkoutCategory.back]: [
      {
        id: BigInt(4),
        name: "Pull-ups",
        category,
        difficultyLevel: DifficultyLevel.intermediate,
        description: "Upper back and lat builder. Full hang to chin over bar.",
        setsRecommended: BigInt(4),
        repsRecommended: BigInt(8),
        restSeconds: BigInt(90),
      },
      {
        id: BigInt(5),
        name: "Bent-Over Row",
        category,
        difficultyLevel: DifficultyLevel.intermediate,
        description:
          "Compound back movement. Keep back flat, pull bar to lower chest.",
        setsRecommended: BigInt(4),
        repsRecommended: BigInt(10),
        restSeconds: BigInt(90),
      },
      {
        id: BigInt(6),
        name: "Deadlift",
        category,
        difficultyLevel: DifficultyLevel.advanced,
        description:
          "King of all lifts. Hinge at hips, keep back straight, drive through heels.",
        setsRecommended: BigInt(4),
        repsRecommended: BigInt(5),
        restSeconds: BigInt(120),
      },
    ],
    [WorkoutCategory.legs]: [
      {
        id: BigInt(7),
        name: "Barbell Squat",
        category,
        difficultyLevel: DifficultyLevel.intermediate,
        description:
          "Foundational leg exercise. Bar on traps, squat to parallel.",
        setsRecommended: BigInt(4),
        repsRecommended: BigInt(10),
        restSeconds: BigInt(120),
      },
      {
        id: BigInt(8),
        name: "Leg Press",
        category,
        difficultyLevel: DifficultyLevel.beginner,
        description:
          "Machine leg exercise. Feet shoulder width, press plate away.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(12),
        restSeconds: BigInt(75),
      },
      {
        id: BigInt(9),
        name: "Walking Lunges",
        category,
        difficultyLevel: DifficultyLevel.beginner,
        description:
          "Functional leg movement. Step forward, lower back knee, alternate.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(12),
        restSeconds: BigInt(60),
      },
    ],
    [WorkoutCategory.cardio]: [
      {
        id: BigInt(10),
        name: "Treadmill Run",
        category,
        difficultyLevel: DifficultyLevel.beginner,
        description:
          "Steady state cardio. Maintain conversational pace for duration.",
        setsRecommended: BigInt(1),
        repsRecommended: BigInt(1),
        restSeconds: BigInt(0),
      },
      {
        id: BigInt(11),
        name: "Jump Rope",
        category,
        difficultyLevel: DifficultyLevel.beginner,
        description:
          "High intensity cardio. Keep elbows in, jump from balls of feet.",
        setsRecommended: BigInt(5),
        repsRecommended: BigInt(1),
        restSeconds: BigInt(30),
      },
      {
        id: BigInt(12),
        name: "Burpees",
        category,
        difficultyLevel: DifficultyLevel.intermediate,
        description:
          "Full body cardio blast. Squat, kick back, push-up, jump up.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(10),
        restSeconds: BigInt(45),
      },
    ],
    [WorkoutCategory.abs]: [
      {
        id: BigInt(13),
        name: "Plank",
        category,
        difficultyLevel: DifficultyLevel.beginner,
        description:
          "Core stability exercise. Keep body straight, breathe steadily.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(1),
        restSeconds: BigInt(45),
      },
      {
        id: BigInt(14),
        name: "Crunches",
        category,
        difficultyLevel: DifficultyLevel.beginner,
        description:
          "Basic ab exercise. Don't pull neck, focus on contracting abs.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(20),
        restSeconds: BigInt(30),
      },
      {
        id: BigInt(15),
        name: "Hanging Leg Raises",
        category,
        difficultyLevel: DifficultyLevel.advanced,
        description:
          "Advanced ab exercise. Hang from bar, raise legs to 90 degrees.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(12),
        restSeconds: BigInt(60),
      },
    ],
    [WorkoutCategory.custom]: [
      {
        id: BigInt(16),
        name: "Custom Exercise",
        category,
        difficultyLevel: DifficultyLevel.beginner,
        description: "Add your own exercises using the manual entry form.",
        setsRecommended: BigInt(3),
        repsRecommended: BigInt(10),
        restSeconds: BigInt(60),
      },
    ],
  };

  const displayExercises =
    exercises.length > 0 ? exercises : (FALLBACK[category] ?? []);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="min-h-screen"
    >
      {/* Header */}
      <div className="px-4 pt-10 pb-4 flex items-center gap-3">
        <button
          type="button"
          data-ocid="workouts.back.button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.14 0 0)" }}
        >
          <ChevronLeft size={20} />
        </button>
        <h1
          className="text-xl font-bold"
          style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            color: categoryColor,
          }}
        >
          {categoryLabel}
        </h1>
        <span className="text-xs text-muted-foreground ml-auto">
          {displayExercises.length} exercises
        </span>
      </div>

      <div className="px-4 space-y-3">
        {isLoading
          ? [1, 2, 3].map((n) => (
              <Skeleton key={`ex-load-${n}`} className="h-20 rounded-2xl" />
            ))
          : displayExercises.map((ex, idx) => (
              <motion.button
                key={String(ex.id)}
                data-ocid={`workouts.exercise.item.${idx + 1}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectExercise(ex)}
                className="w-full p-4 rounded-2xl text-left flex items-center gap-3 active:scale-[0.98] transition-transform"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.20 0 0)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                  style={{ background: `${categoryColor}18` }}
                >
                  {CATEGORIES.find((c) => c.id === category)?.emoji ?? "💪"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {ex.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {String(ex.setsRecommended)} sets ×{" "}
                    {String(ex.repsRecommended)} reps · {String(ex.restSeconds)}
                    s rest
                  </p>
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
                  style={{
                    background: `${DIFF_COLORS[ex.difficultyLevel]}18`,
                    color: DIFF_COLORS[ex.difficultyLevel],
                  }}
                >
                  {ex.difficultyLevel}
                </span>
              </motion.button>
            ))}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────
// Manual Entry Form
// ──────────────────────────────────────────────────
interface ManualEntryProps {
  onClose: () => void;
}

function ManualEntryForm({ onClose }: ManualEntryProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [catVal, setCatVal] = useState<WorkoutCategory>(WorkoutCategory.cardio);
  const [duration, setDuration] = useState("");
  const [cals, setCals] = useState("");
  const logWorkout = useLogWorkout();

  const handleSubmit = async () => {
    if (!exerciseName || !duration) {
      toast.error("Fill in exercise name and duration");
      return;
    }
    try {
      await logWorkout.mutateAsync({
        category: catVal,
        exercise: exerciseName,
        duration: BigInt(Number.parseInt(duration, 10)),
        calories: BigInt(Number.parseInt(cals || "0", 10)),
        date: getTodayDate(),
      });
      toast.success("Workout logged! 💪");
      onClose();
    } catch {
      toast.error("Failed to log workout");
    }
  };

  return (
    <div
      data-ocid="workouts.manual_form.panel"
      className="p-4 rounded-2xl space-y-4"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.22 0 0)",
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">Log Workout Manually</h3>
        <button onClick={onClose} type="button">
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Exercise Name</Label>
          <Input
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g. Morning Run"
            className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={catVal}
            onValueChange={(v) => setCatVal(v as WorkoutCategory)}
          >
            <SelectTrigger className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji} {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">
              Duration (min)
            </Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="30"
              className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Calories</Label>
            <Input
              type="number"
              value={cals}
              onChange={(e) => setCals(e.target.value)}
              placeholder="200"
              className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
            />
          </div>
        </div>
        <Button
          data-ocid="workouts.manual_submit.button"
          onClick={handleSubmit}
          disabled={logWorkout.isPending}
          className="w-full h-10 rounded-xl font-bold text-sm"
          style={{
            background: "oklch(0.87 0.31 140)",
            color: "oklch(0.06 0 0)",
          }}
        >
          {logWorkout.isPending ? "Logging..." : "Log Workout"}
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Main WorkoutsScreen
// ──────────────────────────────────────────────────
type WorkoutView = "categories" | "exercises" | "detail";

export default function WorkoutsScreen() {
  const [view, setView] = useState<WorkoutView>("categories");
  const [selectedCategory, setSelectedCategory] =
    useState<WorkoutCategory | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [calcWeight, setCalcWeight] = useState("");
  const [calcDuration, setCalcDuration] = useState("");

  const { data: profile } = useUserProfile();

  const userWeight = profile?.weightKg ?? 70;
  const heightCm = Number(profile?.heightCm ?? 170);
  const bmi = calculateBMI(userWeight, heightCm);

  const calcCals =
    calcWeight && calcDuration
      ? calculateCalories(
          Number.parseFloat(calcWeight),
          Number.parseFloat(calcDuration),
        )
      : null;

  if (view === "detail" && selectedExercise) {
    return (
      <AnimatePresence>
        <WorkoutDetail
          key="detail"
          exercise={selectedExercise}
          onBack={() => setView("exercises")}
          userWeight={userWeight}
        />
      </AnimatePresence>
    );
  }

  if (view === "exercises" && selectedCategory) {
    const cat = CATEGORIES.find((c) => c.id === selectedCategory)!;
    return (
      <AnimatePresence>
        <ExerciseList
          key="exercises"
          category={selectedCategory}
          categoryLabel={cat.label}
          categoryColor={cat.color}
          onBack={() => setView("categories")}
          onSelectExercise={(ex) => {
            setSelectedExercise(ex);
            setView("detail");
          }}
          userWeight={userWeight}
        />
      </AnimatePresence>
    );
  }

  return (
    <div
      data-ocid="workouts.page"
      className="px-4 pt-10 pb-4 space-y-5 animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
        >
          Workouts
        </h1>
        <button
          type="button"
          data-ocid="workouts.manual_entry.button"
          onClick={() => setShowManualEntry(!showManualEntry)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: showManualEntry
              ? "oklch(0.87 0.31 140 / 0.15)"
              : "oklch(0.14 0 0)",
            border: showManualEntry
              ? "1px solid oklch(0.87 0.31 140 / 0.4)"
              : "1px solid oklch(0.22 0 0)",
            color: showManualEntry ? "oklch(0.87 0.31 140)" : "oklch(0.70 0 0)",
          }}
        >
          <Plus size={14} />
          Log
        </button>
      </div>

      {/* Manual entry form */}
      <AnimatePresence>
        {showManualEntry && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <ManualEntryForm onClose={() => setShowManualEntry(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category grid */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
          Workout Categories
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat, idx) => (
            <motion.button
              key={cat.id}
              data-ocid={CAT_OCID[cat.id]}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => {
                setSelectedCategory(cat.id);
                setView("exercises");
              }}
              className="p-4 rounded-2xl text-left flex flex-col gap-2 active:scale-[0.97] transition-transform"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.20 0 0)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `${cat.color}18` }}
              >
                {cat.emoji}
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{cat.label}</p>
                <p className="text-xs" style={{ color: cat.color }}>
                  Tap to explore →
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* BMI Calculator */}
      <motion.div
        data-ocid="workouts.bmi.card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-2xl"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.20 0 0)",
        }}
      >
        <p className="text-sm font-semibold text-foreground mb-3">
          BMI Calculator
        </p>
        {profile ? (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-4xl font-bold" style={{ color: bmi.color }}>
                {bmi.value || "—"}
              </p>
              <p
                className="text-sm font-medium mt-0.5"
                style={{ color: bmi.color }}
              >
                {bmi.category}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {profile.weightKg}kg · {String(profile.heightCm)}cm
              </p>
            </div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              {[
                { label: "Underweight", range: "< 18.5", c: "#60a5fa" },
                { label: "Normal", range: "18.5–24.9", c: "#39FF14" },
                { label: "Overweight", range: "25–29.9", c: "#f59e0b" },
                { label: "Obese", range: "≥ 30", c: "#ef4444" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: row.c }}
                  />
                  <span
                    style={{
                      color: bmi.category === row.label ? row.c : undefined,
                    }}
                  >
                    {row.label}: {row.range}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Set up your profile to see BMI
          </p>
        )}
      </motion.div>

      {/* Calories Calculator */}
      <motion.div
        data-ocid="workouts.calorie_calc.card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-4 rounded-2xl"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.20 0 0)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Calculator size={15} className="neon-text" />
          <p className="text-sm font-semibold text-foreground">
            Calorie Calculator
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
            <Input
              data-ocid="workouts.calorie_calc.input"
              type="number"
              value={calcWeight}
              onChange={(e) => setCalcWeight(e.target.value)}
              placeholder={String(userWeight)}
              className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Duration (min)
            </Label>
            <Input
              type="number"
              value={calcDuration}
              onChange={(e) => setCalcDuration(e.target.value)}
              placeholder="30"
              className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
            />
          </div>
        </div>
        {calcCals !== null ? (
          <div
            className="p-3 rounded-xl flex items-center justify-between"
            style={{ background: "oklch(0.87 0.31 140 / 0.1)" }}
          >
            <p className="text-xs text-muted-foreground">
              Estimated Calories Burned
            </p>
            <p className="text-xl font-bold neon-text">{calcCals} kcal</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            Enter weight and duration to calculate
          </p>
        )}
      </motion.div>
    </div>
  );
}
