import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Droplets, Flame, Footprints, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  useDailyStats,
  useUpdateDailyStats,
  useUserProfile,
  useWorkoutLogs,
} from "../hooks/useQueries";
import { getTodayDate } from "../hooks/useQueries";
import { computeStreak, getDailyQuote } from "../lib/workoutTemplates";

// ──────────────────────────────────────────────────
// Circular Progress Ring
// ──────────────────────────────────────────────────
interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
}
function ProgressRing({
  value,
  size = 56,
  strokeWidth = 4,
  color = "#39FF14",
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circ - (pct / 100) * circ;
  return (
    <svg
      width={size}
      height={size}
      className="rotate-[-90deg]"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="oklch(0.20 0 0)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 0.8s ease-out",
          filter: `drop-shadow(0 0 4px ${color}70)`,
        }}
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────
// Stat Card
// ──────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  goal: number;
  current: number;
  color: string;
  "data-ocid": string;
}
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  goal,
  current,
  color,
  "data-ocid": ocid,
}: StatCardProps) {
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  return (
    <div
      data-ocid={ocid}
      className="p-4 rounded-2xl flex flex-col gap-2"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.20 0 0)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <ProgressRing value={pct} size={44} strokeWidth={3.5} color={color} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold text-foreground leading-tight">
          {value}
          <span className="text-xs text-muted-foreground font-normal ml-1">
            {unit}
          </span>
        </p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {Math.round(pct)}% of goal
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Weekly Bar Chart
// ──────────────────────────────────────────────────
interface WeeklyChartProps {
  logs: Array<{ date: string; caloriesBurned: bigint }>;
}
function WeeklyChart({ logs }: WeeklyChartProps) {
  const days = useMemo(() => {
    const arr: { label: string; cals: number; isToday: boolean }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d
        .toLocaleDateString("en", { weekday: "short" })
        .slice(0, 3);
      const cals = logs
        .filter((l) => l.date === key)
        .reduce((sum, l) => sum + Number(l.caloriesBurned), 0);
      arr.push({ label, cals, isToday: i === 0 });
    }
    return arr;
  }, [logs]);

  const max = Math.max(...days.map((d) => d.cals), 1);

  return (
    <div
      data-ocid="dashboard.weekly_chart.panel"
      className="p-4 rounded-2xl"
      style={{
        background: "oklch(0.12 0 0)",
        border: "1px solid oklch(0.20 0 0)",
      }}
    >
      <p className="text-sm font-semibold text-foreground mb-4">
        Weekly Calories
      </p>
      <div className="flex items-end justify-between gap-1 h-24">
        {days.map((day) => {
          const h = max > 0 ? (day.cals / max) * 100 : 0;
          return (
            <div
              key={day.label}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full flex items-end justify-center"
                style={{ height: 80 }}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, h)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                  className="w-full rounded-t-sm"
                  style={{
                    background: day.isToday
                      ? "oklch(0.87 0.31 140)"
                      : "oklch(0.22 0 0)",
                    boxShadow: day.isToday
                      ? "0 0 8px oklch(0.87 0.31 140 / 0.4)"
                      : "none",
                    minHeight: 4,
                  }}
                />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: day.isToday
                    ? "oklch(0.87 0.31 140)"
                    : "oklch(0.45 0 0)",
                }}
              >
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2">
        <p className="text-xs text-muted-foreground">0 kcal</p>
        <p className="text-xs text-muted-foreground">
          {max.toLocaleString()} kcal
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Main Dashboard
// ──────────────────────────────────────────────────
export default function DashboardScreen() {
  const today = getTodayDate();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: stats, isLoading: statsLoading } = useDailyStats(today);
  const { data: logs = [] } = useWorkoutLogs();
  const updateStats = useUpdateDailyStats();

  const quote = getDailyQuote();
  const streak = computeStreak(logs);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const todayCalories = useMemo(() => {
    return logs
      .filter((l) => l.date === today)
      .reduce((sum, l) => sum + Number(l.caloriesBurned), 0);
  }, [logs, today]);

  const todayDuration = useMemo(() => {
    return logs
      .filter((l) => l.date === today)
      .reduce((sum, l) => sum + Number(l.durationMinutes), 0);
  }, [logs, today]);

  const handleAddWater = async (ml: number) => {
    const currentWater = Number(stats?.waterIntakeMl ?? 0);
    const currentSteps = Number(stats?.stepsCount ?? 0);
    try {
      await updateStats.mutateAsync({
        date: today,
        steps: BigInt(currentSteps),
        water: BigInt(currentWater + ml),
      });
      toast.success(`+${ml}ml water added! 💧`);
    } catch {
      toast.error("Failed to update water intake");
    }
  };

  if (profileLoading || statsLoading) {
    return (
      <div className="px-4 py-6 space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid="dashboard.page"
      className="px-4 pt-10 pb-4 space-y-4 animate-fade-in"
    >
      {/* Greeting */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground font-medium uppercase tracking-widest"
          >
            {new Date().toLocaleDateString("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl font-bold mt-0.5"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
          >
            {greeting},{" "}
            <span className="neon-text">
              {profile?.name?.split(" ")[0] ?? "Athlete"}
            </span>
            !
          </motion.h1>
        </div>
        {/* Streak badge */}
        {streak > 0 && (
          <motion.div
            data-ocid="dashboard.streak.card"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex flex-col items-center px-3 py-2 rounded-2xl"
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(0.87 0.31 140 / 0.3)",
            }}
          >
            <span className="fire-icon text-lg">🔥</span>
            <span className="neon-text text-sm font-bold leading-none">
              {streak}
            </span>
            <span className="text-[10px] text-muted-foreground">streak</span>
          </motion.div>
        )}
      </div>

      {/* Hero image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="overflow-hidden rounded-2xl relative"
        style={{ border: "1px solid oklch(0.20 0 0)" }}
      >
        <img
          src="/assets/generated/fitforge-hero.dim_800x300.jpg"
          alt="FitForge Hero"
          className="w-full h-28 object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, oklch(0.08 0 0 / 0.7) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 flex items-center px-4">
          <div>
            <p className="text-xs text-neon font-bold uppercase tracking-widest">
              Today's Plan
            </p>
            <p className="text-white font-bold text-base">
              {profile?.fitnessGoal === "weightLoss"
                ? "Burn & Transform"
                : profile?.fitnessGoal === "muscleGain"
                  ? "Lift & Build"
                  : "Move & Maintain"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat cards 2x2 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatCard
          icon={Flame}
          label="Calories Burned"
          value={todayCalories.toLocaleString()}
          unit="kcal"
          goal={500}
          current={todayCalories}
          color="#39FF14"
          data-ocid="dashboard.calories.card"
        />
        <StatCard
          icon={Footprints}
          label="Steps"
          value={Number(stats?.stepsCount ?? 0).toLocaleString()}
          unit="steps"
          goal={10000}
          current={Number(stats?.stepsCount ?? 0)}
          color="#60a5fa"
          data-ocid="dashboard.steps.card"
        />
        <StatCard
          icon={Clock}
          label="Workout Time"
          value={String(todayDuration)}
          unit="min"
          goal={60}
          current={todayDuration}
          color="#a78bfa"
          data-ocid="dashboard.duration.card"
        />
        <StatCard
          icon={Droplets}
          label="Water Intake"
          value={Number(stats?.waterIntakeMl ?? 0).toLocaleString()}
          unit="ml"
          goal={2500}
          current={Number(stats?.waterIntakeMl ?? 0)}
          color="#38bdf8"
          data-ocid="dashboard.water.card"
        />
      </motion.div>

      {/* Water quick-add */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-2xl"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.20 0 0)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets size={16} style={{ color: "#38bdf8" }} />
            <p className="text-sm font-semibold text-foreground">
              Water Intake
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {Number(stats?.waterIntakeMl ?? 0)} / 2500 ml
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            data-ocid="dashboard.water_add.button"
            onClick={() => void handleAddWater(250)}
            disabled={updateStats.isPending}
            className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
            style={{
              background: "oklch(0.16 0 0)",
              border: "1px solid oklch(0.22 0 0)",
              color: "#38bdf8",
            }}
          >
            <Plus size={14} />
            250ml
          </button>
          <button
            type="button"
            data-ocid="dashboard.water_add.button"
            onClick={() => void handleAddWater(500)}
            disabled={updateStats.isPending}
            className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
            style={{
              background: "oklch(0.16 0 0)",
              border: "1px solid oklch(0.22 0 0)",
              color: "#38bdf8",
            }}
          >
            <Plus size={14} />
            500ml
          </button>
        </div>
      </motion.div>

      {/* Weekly chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <WeeklyChart logs={logs} />
      </motion.div>

      {/* Motivational quote */}
      <motion.div
        data-ocid="dashboard.quote.card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-2xl relative overflow-hidden"
        style={{
          background: "oklch(0.87 0.31 140 / 0.08)",
          border: "1px solid oklch(0.87 0.31 140 / 0.25)",
        }}
      >
        <p className="text-xs neon-text font-bold uppercase tracking-widest mb-2">
          Daily Motivation
        </p>
        <p className="text-sm text-foreground font-medium leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </p>
        <div
          className="absolute top-3 right-3 text-3xl opacity-20"
          style={{ lineHeight: 1 }}
        >
          &ldquo;
        </div>
      </motion.div>

      {/* Footer spacer */}
      <div className="h-2" />
    </div>
  );
}
