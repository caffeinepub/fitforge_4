import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Clock,
  Flame,
  Footprints,
  Plus,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAddWeightEntry,
  useDeleteWorkoutLog,
  useWeightEntries,
  useWorkoutLogs,
} from "../hooks/useQueries";
import { getTodayDate } from "../hooks/useQueries";

// ──────────────────────────────────────────────────
// Simple Sparkline chart (div-based)
// ──────────────────────────────────────────────────
interface SparklineProps {
  points: number[];
  color?: string;
  height?: number;
}
function Sparkline({ points, color = "#39FF14", height = 60 }: SparklineProps) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 100 / (points.length - 1);

  const svgPoints = points
    .map(
      (p, i) => `${i * w},${height - ((p - min) / range) * (height - 8) - 4}`,
    )
    .join(" ");

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`${svgPoints},${(points.length - 1) * w},${height} 0,${height}`}
        fill="url(#sparkGrad)"
        stroke="none"
      />
      <polyline
        points={svgPoints}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 3px ${color}60)` }}
      />
    </svg>
  );
}

// ──────────────────────────────────────────────────
// Progress Screen
// ──────────────────────────────────────────────────
export default function ProgressScreen() {
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);

  const { data: weightEntries = [], isLoading: weightLoading } =
    useWeightEntries();
  const { data: logs = [], isLoading: logsLoading } = useWorkoutLogs();
  const addWeight = useAddWeightEntry();
  const deleteLog = useDeleteWorkoutLog();

  // Weekly analytics
  const weeklyAnalytics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekLogs = logs.filter((l) => new Date(l.date) >= weekAgo);
    return {
      totalWorkouts: weekLogs.length,
      totalCalories: weekLogs.reduce((s, l) => s + Number(l.caloriesBurned), 0),
      totalDuration: weekLogs.reduce(
        (s, l) => s + Number(l.durationMinutes),
        0,
      ),
      avgDailySteps: 0, // would need daily stats aggregation
    };
  }, [logs]);

  // Sorted weight entries
  const sortedWeights = useMemo(() => {
    return [...weightEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [weightEntries]);

  // Sorted logs
  const sortedLogs = useMemo(() => {
    return [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [logs]);

  const handleAddWeight = async () => {
    const w = Number.parseFloat(weightInput);
    if (!w || w < 20 || w > 500) {
      toast.error("Enter a valid weight (20–500 kg)");
      return;
    }
    try {
      await addWeight.mutateAsync({ weightKg: w, date: getTodayDate() });
      toast.success(`Weight logged: ${w} kg ✅`);
      setWeightInput("");
      setShowWeightForm(false);
    } catch {
      toast.error("Failed to log weight");
    }
  };

  const handleDeleteLog = async (id: bigint) => {
    try {
      await deleteLog.mutateAsync(id);
      toast.success("Workout removed");
      setConfirmDeleteId(null);
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  const weightPoints = sortedWeights.map((e) => e.weightKg);
  const firstWeight = sortedWeights[0]?.weightKg;
  const lastWeight = sortedWeights[sortedWeights.length - 1]?.weightKg;
  const weightChange = firstWeight && lastWeight ? lastWeight - firstWeight : 0;

  return (
    <div
      data-ocid="progress.page"
      className="px-4 pt-10 pb-4 space-y-5 animate-fade-in"
    >
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
        >
          Progress
        </h1>
        <button
          type="button"
          data-ocid="progress.add_weight.button"
          onClick={() => setShowWeightForm(!showWeightForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: showWeightForm
              ? "oklch(0.87 0.31 140 / 0.15)"
              : "oklch(0.14 0 0)",
            border: showWeightForm
              ? "1px solid oklch(0.87 0.31 140 / 0.4)"
              : "1px solid oklch(0.22 0 0)",
            color: showWeightForm ? "oklch(0.87 0.31 140)" : "oklch(0.70 0 0)",
          }}
        >
          <Plus size={14} />
          Weight
        </button>
      </div>

      {/* Weight form */}
      <AnimatePresence>
        {showWeightForm && (
          <motion.div
            data-ocid="progress.weight_form.panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 rounded-2xl space-y-3"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.22 0 0)",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Log Today&apos;s Weight</h3>
                <button type="button" onClick={() => setShowWeightForm(false)}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 75.5"
                  step={0.1}
                  className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
                  onKeyDown={(e) => e.key === "Enter" && void handleAddWeight()}
                />
              </div>
              <Button
                onClick={handleAddWeight}
                disabled={addWeight.isPending}
                className="w-full h-10 rounded-xl font-bold text-sm"
                style={{
                  background: "oklch(0.87 0.31 140)",
                  color: "oklch(0.06 0 0)",
                }}
              >
                {addWeight.isPending ? "Logging..." : "Log Weight"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weight Chart */}
      <motion.div
        data-ocid="progress.weight_chart.panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.20 0 0)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="neon-text" />
            <p className="text-sm font-semibold text-foreground">
              Weight Progress
            </p>
          </div>
          {weightChange !== 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background:
                  weightChange < 0
                    ? "oklch(0.87 0.31 140 / 0.15)"
                    : "oklch(0.60 0.22 25 / 0.15)",
                color: weightChange < 0 ? "oklch(0.87 0.31 140)" : "#ef4444",
              }}
            >
              {weightChange > 0 ? "+" : ""}
              {weightChange.toFixed(1)} kg
            </span>
          )}
        </div>

        {weightLoading ? (
          <Skeleton className="h-16 w-full rounded-xl" />
        ) : sortedWeights.length >= 2 ? (
          <>
            <Sparkline points={weightPoints} />
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-xs text-muted-foreground">Start</p>
                <p className="text-sm font-bold text-foreground">
                  {firstWeight} kg
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current</p>
                <p className="text-sm font-bold neon-text">{lastWeight} kg</p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-muted-foreground">
              Log at least 2 weight entries to see your chart
            </p>
          </div>
        )}
      </motion.div>

      {/* Weekly Analytics */}
      <motion.div
        data-ocid="progress.weekly_analytics.panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.20 0 0)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="neon-text" />
          <p className="text-sm font-semibold text-foreground">7-Day Summary</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Workouts",
              value: String(weeklyAnalytics.totalWorkouts),
              icon: Activity,
              color: "#39FF14",
            },
            {
              label: "Calories",
              value: `${weeklyAnalytics.totalCalories.toLocaleString()} kcal`,
              icon: Flame,
              color: "#ff6b6b",
            },
            {
              label: "Duration",
              value: `${weeklyAnalytics.totalDuration} min`,
              icon: Clock,
              color: "#a78bfa",
            },
            {
              label: "Avg Steps",
              value: "—",
              icon: Footprints,
              color: "#60a5fa",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-3 rounded-xl"
                style={{ background: "oklch(0.10 0 0)" }}
              >
                <Icon
                  size={14}
                  style={{ color: stat.color }}
                  className="mb-1.5"
                />
                <p className="text-base font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Workout History */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Workout History
          </p>
          <p className="text-xs text-muted-foreground">
            {sortedLogs.length} entries
          </p>
        </div>

        {logsLoading ? (
          [1, 2, 3].map((n) => (
            <Skeleton key={`log-skel-${n}`} className="h-16 rounded-2xl" />
          ))
        ) : sortedLogs.length === 0 ? (
          <div
            data-ocid="progress.history.empty_state"
            className="py-10 text-center"
          >
            <p className="text-sm text-muted-foreground">
              No workouts logged yet.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Go to Workouts to log your first session!
            </p>
          </div>
        ) : (
          <div data-ocid="progress.history.list" className="space-y-2">
            {sortedLogs.map((log, idx) => (
              <motion.div
                key={String(log.id)}
                data-ocid={`progress.history.item.${idx + 1}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-3 rounded-2xl flex items-center gap-3"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.18 0 0)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: "oklch(0.87 0.31 140 / 0.10)" }}
                >
                  💪
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {log.exerciseName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.date} · {String(log.durationMinutes)} min ·{" "}
                    {String(log.caloriesBurned)} kcal
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {confirmDeleteId === log.id ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="flex gap-1.5"
                    >
                      <button
                        type="button"
                        data-ocid={`progress.history.delete.button.${idx + 1}`}
                        onClick={() => void handleDeleteLog(log.id)}
                        disabled={deleteLog.isPending}
                        className="text-xs px-2 py-1 rounded-lg font-semibold"
                        style={{ background: "#ef4444", color: "white" }}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs px-2 py-1 rounded-lg font-semibold"
                        style={{
                          background: "oklch(0.18 0 0)",
                          color: "oklch(0.60 0 0)",
                        }}
                      >
                        Cancel
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      data-ocid={`progress.history.delete.button.${idx + 1}`}
                      onClick={() => setConfirmDeleteId(log.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "oklch(0.16 0 0)" }}
                    >
                      <Trash2 size={14} style={{ color: "#ef4444" }} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
