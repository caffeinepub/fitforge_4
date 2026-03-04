import { Button } from "@/components/ui/button";
import { Beef, ChevronDown, ChevronUp, Leaf, Loader2, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { DietType, DifficultyLevel, FitnessGoal } from "../backend.d";
import {
  useDietRecommendation,
  useSaveDietRecommendation,
  useSaveWorkoutPlan,
  useUserProfile,
  useWorkoutPlan,
} from "../hooks/useQueries";
import {
  calculateDailyCalories,
  getWorkoutPlanTemplate,
} from "../lib/workoutTemplates";
import type { WorkoutPlanTemplate } from "../lib/workoutTemplates";

// ──────────────────────────────────────────────────
// Toggle Group
// ──────────────────────────────────────────────────
interface ToggleGroupProps<T extends string> {
  options: { value: T; label: string; emoji?: string }[];
  value: T;
  onChange: (v: T) => void;
  "data-ocid": string;
  color?: string;
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  "data-ocid": ocid,
  color = "#39FF14",
}: ToggleGroupProps<T>) {
  return (
    <div className="flex gap-2" data-ocid={ocid}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex-1 h-10 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1"
            style={{
              background: isActive ? `${color}18` : "oklch(0.14 0 0)",
              border: isActive
                ? `1px solid ${color}50`
                : "1px solid oklch(0.20 0 0)",
              color: isActive ? color : "oklch(0.55 0 0)",
              boxShadow: isActive ? `0 0 10px ${color}20` : "none",
            }}
          >
            {opt.emoji && <span>{opt.emoji}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────
// Day Plan Accordion
// ──────────────────────────────────────────────────
interface DayPlanProps {
  plan: WorkoutPlanTemplate;
}
function DayPlanAccordion({ plan }: DayPlanProps) {
  const [openDay, setOpenDay] = useState<number | null>(0);

  return (
    <div data-ocid="ai_trainer.plan.panel" className="space-y-2">
      {plan.days.map((day, idx) => {
        const isOpen = openDay === idx;
        const ocid = `ai_trainer.day.item.${idx + 1}` as const;
        return (
          <div
            key={day.day}
            data-ocid={ocid}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.12 0 0)",
              border: day.isRest
                ? "1px solid oklch(0.20 0 0)"
                : "1px solid oklch(0.87 0.31 140 / 0.20)",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenDay(isOpen ? null : idx)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{
                    background: day.isRest
                      ? "oklch(0.16 0 0)"
                      : "oklch(0.87 0.31 140 / 0.15)",
                    color: day.isRest
                      ? "oklch(0.45 0 0)"
                      : "oklch(0.87 0.31 140)",
                  }}
                >
                  D{day.day}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {day.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{day.focus}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {day.isRest && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    Rest
                  </span>
                )}
                {isOpen ? (
                  <ChevronUp size={16} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={16} className="text-muted-foreground" />
                )}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {day.exercises.map((ex) => (
                      <div
                        key={ex.name}
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: "oklch(0.10 0 0)" }}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {ex.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ex.sets} × {ex.reps}
                            {ex.rest > 0 && ` · ${ex.rest}s rest`}
                          </p>
                        </div>
                        {ex.notes && (
                          <p className="text-xs text-muted-foreground max-w-[100px] text-right">
                            {ex.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────
// Diet Card
// ──────────────────────────────────────────────────
interface DietCardProps {
  goal: FitnessGoal;
  dietType: DietType;
  weight: number;
}
function DietCard({ goal, dietType, weight }: DietCardProps) {
  const dailyCals = calculateDailyCalories(weight, goal);
  const protein = Math.round(
    weight * (goal === FitnessGoal.muscleGain ? 2.2 : 1.8),
  );
  const carbs = Math.round((dailyCals * 0.45) / 4);
  const fats = Math.round((dailyCals * 0.25) / 9);

  const VEG_MEALS = [
    { meal: "Breakfast", items: "Oats + banana + almond milk smoothie" },
    { meal: "Lunch", items: "Brown rice + dal + mixed veggie curry" },
    { meal: "Snack", items: "Greek yogurt + mixed nuts + apple" },
    { meal: "Dinner", items: "Paneer tikka + roti + salad" },
  ];

  const NONVEG_MEALS = [
    { meal: "Breakfast", items: "Scrambled eggs (3) + whole wheat toast + OJ" },
    {
      meal: "Lunch",
      items: "Grilled chicken breast + quinoa + steamed broccoli",
    },
    { meal: "Snack", items: "Tuna on rice crackers + cottage cheese" },
    { meal: "Dinner", items: "Salmon fillet + sweet potato + asparagus" },
  ];

  const meals = dietType === DietType.veg ? VEG_MEALS : NONVEG_MEALS;

  return (
    <div
      data-ocid="ai_trainer.diet.card"
      className="p-4 rounded-2xl space-y-4"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.87 0.31 140 / 0.20)",
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Diet Recommendation</p>
        <div className="flex items-center gap-1">
          {dietType === DietType.veg ? (
            <Leaf size={14} style={{ color: "#39FF14" }} />
          ) : (
            <Beef size={14} style={{ color: "#ef4444" }} />
          )}
          <span
            className="text-xs font-medium"
            style={{ color: dietType === DietType.veg ? "#39FF14" : "#ef4444" }}
          >
            {dietType === DietType.veg ? "Vegetarian" : "Non-Vegetarian"}
          </span>
        </div>
      </div>

      {/* Calorie target */}
      <div
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ background: "oklch(0.87 0.31 140 / 0.08)" }}
      >
        <p className="text-xs text-muted-foreground">Daily Calorie Target</p>
        <p className="text-xl font-bold neon-text">
          {dailyCals.toLocaleString()} kcal
        </p>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Protein", value: `${protein}g`, color: "#60a5fa", pct: 30 },
          { label: "Carbs", value: `${carbs}g`, color: "#39FF14", pct: 45 },
          { label: "Fats", value: `${fats}g`, color: "#f59e0b", pct: 25 },
        ].map((m) => (
          <div
            key={m.label}
            className="p-3 rounded-xl text-center"
            style={{ background: "oklch(0.10 0 0)" }}
          >
            <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
            <p className="text-base font-bold" style={{ color: m.color }}>
              {m.value}
            </p>
            <div
              className="mt-1.5 h-1 rounded-full overflow-hidden"
              style={{ background: "oklch(0.18 0 0)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${m.pct}%`, background: m.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Meal suggestions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sample Meal Plan
        </p>
        {meals.map((meal) => (
          <div
            key={meal.meal}
            className="flex gap-3 p-2.5 rounded-xl"
            style={{ background: "oklch(0.10 0 0)" }}
          >
            <span
              className="text-xs font-bold w-16 shrink-0"
              style={{ color: "oklch(0.87 0.31 140)" }}
            >
              {meal.meal}
            </span>
            <span className="text-xs text-muted-foreground">{meal.items}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Main AI Trainer Screen
// ──────────────────────────────────────────────────
export default function AITrainerScreen() {
  const { data: profile } = useUserProfile();
  const { data: savedPlan } = useWorkoutPlan();
  const { data: _savedDiet } = useDietRecommendation();

  const [goal, setGoal] = useState<FitnessGoal>(
    profile?.fitnessGoal ?? FitnessGoal.maintainFitness,
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    DifficultyLevel.beginner,
  );
  const [dietType, setDietType] = useState<DietType>(DietType.nonVeg);
  const [generatedPlan, setGeneratedPlan] =
    useState<WorkoutPlanTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const saveWorkoutPlan = useSaveWorkoutPlan();
  const saveDiet = useSaveDietRecommendation();

  // Show existing plan if available
  const displayPlan =
    generatedPlan ??
    (() => {
      if (savedPlan?.planJson) {
        try {
          return JSON.parse(savedPlan.planJson) as WorkoutPlanTemplate;
        } catch {
          return null;
        }
      }
      return null;
    })();

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate processing delay for UX feel
    await new Promise((r) => setTimeout(r, 1200));

    const template = getWorkoutPlanTemplate(goal, difficulty);
    setGeneratedPlan(template);

    const weight = profile?.weightKg ?? 70;
    const dailyCals = calculateDailyCalories(weight, goal);

    try {
      await Promise.all([
        saveWorkoutPlan.mutateAsync({
          goal,
          difficulty,
          planJson: JSON.stringify(template),
        }),
        saveDiet.mutateAsync({
          dietType,
          dailyCalories: BigInt(dailyCals),
          planJson: JSON.stringify({ goal, dietType, dailyCals }),
        }),
      ]);
      toast.success("Your personalized plan is ready! 🎯");
    } catch {
      toast.error("Failed to save plan — but you can still view it below.");
    }

    setIsGenerating(false);
  };

  return (
    <div
      data-ocid="ai_trainer.page"
      className="px-4 pt-10 pb-4 space-y-5 animate-fade-in"
    >
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-0.5">
          <Zap size={22} className="neon-text" />
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
          >
            AI Trainer
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate your personalized 7-day plan
        </p>
      </div>

      {/* Selector panel */}
      <div
        className="p-4 rounded-2xl space-y-4"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.20 0 0)",
        }}
      >
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Your Goal
          </p>
          <ToggleGroup
            data-ocid="ai_trainer.goal.toggle"
            options={[
              { value: FitnessGoal.weightLoss, label: "Fat Loss", emoji: "🔥" },
              { value: FitnessGoal.muscleGain, label: "Muscle", emoji: "💪" },
              {
                value: FitnessGoal.maintainFitness,
                label: "Maintain",
                emoji: "⚡",
              },
            ]}
            value={goal}
            onChange={setGoal}
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Difficulty
          </p>
          <ToggleGroup
            data-ocid="ai_trainer.difficulty.toggle"
            options={[
              { value: DifficultyLevel.beginner, label: "Beginner" },
              { value: DifficultyLevel.intermediate, label: "Inter." },
              { value: DifficultyLevel.advanced, label: "Advanced" },
            ]}
            value={difficulty}
            onChange={setDifficulty}
            color="#a78bfa"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Diet Type
          </p>
          <ToggleGroup
            data-ocid="ai_trainer.diet.toggle"
            options={[
              { value: DietType.veg, label: "Vegetarian", emoji: "🥗" },
              { value: DietType.nonVeg, label: "Non-Veg", emoji: "🥩" },
            ]}
            value={dietType}
            onChange={setDietType}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Generate button */}
      <Button
        data-ocid="ai_trainer.generate.button"
        onClick={handleGenerate}
        disabled={isGenerating || saveWorkoutPlan.isPending}
        className="w-full h-14 rounded-2xl text-base font-bold relative overflow-hidden"
        style={{
          background: isGenerating
            ? "oklch(0.65 0.25 140)"
            : "oklch(0.87 0.31 140)",
          color: "oklch(0.06 0 0)",
          boxShadow: isGenerating
            ? "none"
            : "0 0 24px oklch(0.87 0.31 140 / 0.4)",
        }}
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            Generating Your Plan...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Zap size={18} />
            {displayPlan ? "Regenerate Plan" : "Generate My Plan"}
          </span>
        )}
      </Button>

      {/* Plan display */}
      <AnimatePresence>
        {displayPlan && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-px"
                style={{ background: "oklch(0.87 0.31 140 / 0.3)" }}
              />
              <p className="text-xs neon-text font-bold uppercase tracking-widest px-2">
                7-Day Plan
              </p>
              <div
                className="flex-1 h-px"
                style={{ background: "oklch(0.87 0.31 140 / 0.3)" }}
              />
            </div>

            <DayPlanAccordion plan={displayPlan} />

            {/* Diet recommendation */}
            <DietCard
              goal={goal}
              dietType={dietType}
              weight={profile?.weightKg ?? 70}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder if no plan yet */}
      {!displayPlan && !isGenerating && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: "oklch(0.87 0.31 140 / 0.08)",
              border: "1px solid oklch(0.87 0.31 140 / 0.2)",
            }}
          >
            <Zap size={32} className="neon-text" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Configure your preferences above and tap{" "}
            <strong className="text-foreground">Generate</strong> to get your
            personalized AI workout plan.
          </p>
        </div>
      )}
    </div>
  );
}
