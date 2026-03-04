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
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  ChevronLeft,
  Dumbbell,
  Loader2,
  Plus,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { DifficultyLevel, WorkoutCategory } from "../backend.d";
import {
  useAllUserProfiles,
  useCreateExercise,
  useCreateNotification,
  useDeleteExercise,
  useExercisesByCategory,
  useIsAdmin,
  useUserCount,
} from "../hooks/useQueries";

type AdminTab = "stats" | "exercises" | "notifications";

const CATEGORIES = [
  { id: WorkoutCategory.chest, label: "Chest" },
  { id: WorkoutCategory.back, label: "Back" },
  { id: WorkoutCategory.legs, label: "Legs" },
  { id: WorkoutCategory.cardio, label: "Cardio" },
  { id: WorkoutCategory.abs, label: "Abs" },
  { id: WorkoutCategory.custom, label: "Custom" },
];

// ──────────────────────────────────────────────────
// Exercise Manager
// ──────────────────────────────────────────────────
function ExerciseManager() {
  const [activeCategory, setActiveCategory] = useState<WorkoutCategory>(
    WorkoutCategory.chest,
  );
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSets, setFormSets] = useState("3");
  const [formReps, setFormReps] = useState("10");
  const [formRest, setFormRest] = useState("60");
  const [formDiff, setFormDiff] = useState<DifficultyLevel>(
    DifficultyLevel.beginner,
  );

  const { data: exercises = [], isLoading } =
    useExercisesByCategory(activeCategory);
  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormSets("3");
    setFormReps("10");
    setFormRest("60");
    setFormDiff(DifficultyLevel.beginner);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!formName) {
      toast.error("Name is required");
      return;
    }
    try {
      await createExercise.mutateAsync({
        category: activeCategory,
        name: formName,
        description: formDesc,
        setsRec: BigInt(Number.parseInt(formSets, 10) || 3),
        repsRec: BigInt(Number.parseInt(formReps, 10) || 10),
        restSecs: BigInt(Number.parseInt(formRest, 10) || 60),
        difficulty: formDiff,
      });
      toast.success("Exercise created!");
      resetForm();
    } catch {
      toast.error("Failed to create exercise");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteExercise.mutateAsync(id);
      toast.success("Exercise deleted");
    } catch {
      toast.error("Failed to delete exercise");
    }
  };

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background:
                activeCategory === cat.id
                  ? "oklch(0.87 0.31 140)"
                  : "oklch(0.14 0 0)",
              color:
                activeCategory === cat.id
                  ? "oklch(0.06 0 0)"
                  : "oklch(0.55 0 0)",
              border:
                activeCategory === cat.id
                  ? "none"
                  : "1px solid oklch(0.20 0 0)",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Add exercise button */}
      <button
        type="button"
        data-ocid="admin.exercise_add.button"
        onClick={() => setShowForm(!showForm)}
        className="w-full p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
        style={{
          background: showForm
            ? "oklch(0.14 0 0)"
            : "oklch(0.87 0.31 140 / 0.10)",
          border: `1px solid ${showForm ? "oklch(0.20 0 0)" : "oklch(0.87 0.31 140 / 0.3)"}`,
          color: showForm ? "oklch(0.55 0 0)" : "oklch(0.87 0.31 140)",
        }}
      >
        {showForm ? <X size={14} /> : <Plus size={14} />}
        {showForm ? "Cancel" : "Add Exercise"}
      </button>

      {/* Add form */}
      {showForm && (
        <motion.div
          data-ocid="admin.exercise_form.panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl space-y-3"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.22 0 0)",
          }}
        >
          <div>
            <Label className="text-xs text-muted-foreground">Name *</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Exercise name"
              className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Exercise description..."
              className="mt-1 bg-secondary border-border rounded-xl text-sm resize-none"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Sets</Label>
              <Input
                type="number"
                value={formSets}
                onChange={(e) => setFormSets(e.target.value)}
                className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reps</Label>
              <Input
                type="number"
                value={formReps}
                onChange={(e) => setFormReps(e.target.value)}
                className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Rest (s)</Label>
              <Input
                type="number"
                value={formRest}
                onChange={(e) => setFormRest(e.target.value)}
                className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Difficulty</Label>
            <Select
              value={formDiff}
              onValueChange={(v) => setFormDiff(v as DifficultyLevel)}
            >
              <SelectTrigger className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DifficultyLevel.beginner}>
                  Beginner
                </SelectItem>
                <SelectItem value={DifficultyLevel.intermediate}>
                  Intermediate
                </SelectItem>
                <SelectItem value={DifficultyLevel.advanced}>
                  Advanced
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            data-ocid="admin.exercise_submit.button"
            onClick={handleCreate}
            disabled={createExercise.isPending}
            className="w-full h-10 rounded-xl font-bold text-sm"
            style={{
              background: "oklch(0.87 0.31 140)",
              color: "oklch(0.06 0 0)",
            }}
          >
            {createExercise.isPending ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : (
              <Plus size={14} className="mr-2" />
            )}
            Create Exercise
          </Button>
        </motion.div>
      )}

      {/* Exercise list */}
      {isLoading ? (
        [1, 2, 3].map((n) => (
          <Skeleton key={`ex-skel-${n}`} className="h-14 rounded-xl" />
        ))
      ) : exercises.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No exercises in{" "}
          {CATEGORIES.find((c) => c.id === activeCategory)?.label}
        </p>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex, _idx) => (
            <div
              key={String(ex.id)}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.18 0 0)",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {ex.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {String(ex.setsRecommended)}×{String(ex.repsRecommended)} ·{" "}
                  {ex.difficultyLevel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(ex.id)}
                disabled={deleteExercise.isPending}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.60 0.22 25 / 0.15)" }}
              >
                <Trash2 size={14} style={{ color: "#ef4444" }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────
// Main Admin Screen
// ──────────────────────────────────────────────────
export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [notifText, setNotifText] = useState("");

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: userCount = BigInt(0) } = useUserCount();
  const { data: allUsers = [] } = useAllUserProfiles();
  const createNotif = useCreateNotification();

  const handleSendNotif = async () => {
    if (!notifText.trim()) {
      toast.error("Enter a message");
      return;
    }
    try {
      await createNotif.mutateAsync(notifText);
      toast.success("Notification sent! 📣");
      setNotifText("");
    } catch {
      toast.error("Failed to send notification");
    }
  };

  if (adminLoading) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <Loader2 size={24} className="neon-text animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-screen px-6 text-center gap-4">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center"
          style={{ background: "oklch(0.60 0.22 25 / 0.15)" }}
        >
          <Shield size={28} style={{ color: "#ef4444" }} />
        </div>
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
        >
          Access Denied
        </h1>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have admin privileges.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.hash = "";
            window.location.reload();
          }}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: "oklch(0.87 0.31 140)" }}
        >
          <ChevronLeft size={16} />
          Back to App
        </button>
      </div>
    );
  }

  return (
    <div data-ocid="admin.page" className="app-shell min-h-screen">
      {/* Header */}
      <div
        className="px-4 pt-12 pb-4 sticky top-0 z-10"
        style={{
          background: "oklch(0.08 0 0)",
          borderBottom: "1px solid oklch(0.18 0 0)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "";
              window.location.reload();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.14 0 0)" }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Shield size={18} className="neon-text" />
            <h1
              className="text-lg font-bold"
              style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
            >
              Admin Panel
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(
            [
              { id: "stats" as AdminTab, label: "Stats", icon: Users },
              {
                id: "exercises" as AdminTab,
                label: "Exercises",
                icon: Dumbbell,
              },
              {
                id: "notifications" as AdminTab,
                label: "Notifications",
                icon: Bell,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: isActive
                    ? "oklch(0.87 0.31 140)"
                    : "oklch(0.14 0 0)",
                  color: isActive ? "oklch(0.06 0 0)" : "oklch(0.55 0 0)",
                  border: isActive ? "none" : "1px solid oklch(0.20 0 0)",
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 pb-10">
        {activeTab === "stats" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Count cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.20 0 0)",
                }}
              >
                <Users size={18} className="neon-text mb-2" />
                <p className="text-2xl font-bold neon-text">
                  {String(userCount)}
                </p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.20 0 0)",
                }}
              >
                <div className="w-4 h-4 rounded-full bg-green-500 mb-2 animate-pulse" />
                <p className="text-2xl font-bold text-foreground">
                  {allUsers.length}
                </p>
                <p className="text-xs text-muted-foreground">Profiles</p>
              </div>
            </div>

            {/* Users table */}
            <div
              data-ocid="admin.users.table"
              className="rounded-2xl overflow-hidden"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.20 0 0)",
              }}
            >
              <div
                className="px-4 py-3 flex gap-2 text-xs font-semibold text-muted-foreground"
                style={{ borderBottom: "1px solid oklch(0.18 0 0)" }}
              >
                <span className="flex-1">User</span>
                <span className="w-20">Goal</span>
                <span className="w-16 text-right">Weight</span>
              </div>
              {allUsers.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">No users yet</p>
                </div>
              ) : (
                allUsers.slice(0, 10).map(([principal, user], idx) => {
                  const principalStr = principal.toString();
                  return (
                    <div
                      key={principalStr}
                      data-ocid={`admin.users.row.${idx + 1}`}
                      className="px-4 py-3 flex gap-2 items-center"
                      style={{
                        borderBottom:
                          idx < allUsers.length - 1
                            ? "1px solid oklch(0.16 0 0)"
                            : "none",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {user.name || "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          {principalStr.slice(0, 16)}…
                        </p>
                      </div>
                      <span className="text-[10px] w-20 text-muted-foreground truncate">
                        {user.fitnessGoal}
                      </span>
                      <span className="text-xs font-mono w-16 text-right text-foreground">
                        {user.weightKg}kg
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "exercises" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ExerciseManager />
          </motion.div>
        )}

        {activeTab === "notifications" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div
              className="p-4 rounded-2xl space-y-3"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.20 0 0)",
              }}
            >
              <p className="text-sm font-bold text-foreground">
                Send Motivational Notification
              </p>
              <div>
                <Label className="text-xs text-muted-foreground">Message</Label>
                <Textarea
                  data-ocid="admin.notification.input"
                  value={notifText}
                  onChange={(e) => setNotifText(e.target.value)}
                  placeholder="Type your motivational message..."
                  className="mt-1 bg-secondary border-border rounded-xl text-sm resize-none"
                  rows={3}
                />
              </div>
              <Button
                data-ocid="admin.notification_send.button"
                onClick={handleSendNotif}
                disabled={createNotif.isPending}
                className="w-full h-10 rounded-xl font-bold text-sm"
                style={{
                  background: "oklch(0.87 0.31 140)",
                  color: "oklch(0.06 0 0)",
                }}
              >
                {createNotif.isPending ? (
                  <Loader2 size={14} className="animate-spin mr-2" />
                ) : (
                  <Bell size={14} className="mr-2" />
                )}
                Send to All Users
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
