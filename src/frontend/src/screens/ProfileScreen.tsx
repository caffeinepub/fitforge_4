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
  Bell,
  ChevronRight,
  Edit3,
  LogOut,
  Save,
  Shield,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { FitnessGoal, Gender } from "../backend.d";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useNotifications,
  useSaveUserProfile,
  useUserProfile,
} from "../hooks/useQueries";

const GOAL_LABELS: Record<FitnessGoal, string> = {
  [FitnessGoal.weightLoss]: "Weight Loss",
  [FitnessGoal.muscleGain]: "Muscle Gain",
  [FitnessGoal.maintainFitness]: "Maintain Fitness",
};

const GOAL_COLORS: Record<FitnessGoal, string> = {
  [FitnessGoal.weightLoss]: "#ff6b6b",
  [FitnessGoal.muscleGain]: "#39FF14",
  [FitnessGoal.maintainFitness]: "#a78bfa",
};

interface ProfileScreenProps {
  onNavigateAdmin: () => void;
}

export default function ProfileScreen({ onNavigateAdmin }: ProfileScreenProps) {
  const { data: profile, isLoading } = useUserProfile();
  const { data: notifications = [] } = useNotifications();
  const saveProfile = useSaveUserProfile();
  const { clear, identity } = useInternetIdentity();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState<Gender>(Gender.male);
  const [editHeight, setEditHeight] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editGoal, setEditGoal] = useState<FitnessGoal>(
    FitnessGoal.maintainFitness,
  );

  const startEditing = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditAge(String(profile.age));
    setEditGender(profile.gender);
    setEditHeight(String(profile.heightCm));
    setEditWeight(String(profile.weightKg));
    setEditGoal(profile.fitnessGoal);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editName) {
      toast.error("Name is required");
      return;
    }
    const updated: UserProfile = {
      name: editName,
      age: BigInt(Number.parseInt(editAge, 10) || 0),
      gender: editGender,
      heightCm: BigInt(Number.parseInt(editHeight, 10) || 0),
      weightKg: Number.parseFloat(editWeight) || 0,
      fitnessGoal: editGoal,
    };
    try {
      await saveProfile.mutateAsync(updated);
      toast.success("Profile updated! ✅");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleLogout = () => {
    clear();
    toast.success("Logged out successfully");
  };

  const principal = identity?.getPrincipal().toString();
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  if (isLoading) {
    return (
      <div className="px-4 pt-10 pb-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      data-ocid="profile.page"
      className="px-4 pt-10 pb-4 space-y-4 animate-fade-in"
    >
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-3xl"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.87 0.31 140 / 0.20)",
        }}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{
              background: "oklch(0.87 0.31 140 / 0.15)",
              border: "2px solid oklch(0.87 0.31 140 / 0.4)",
              color: "oklch(0.87 0.31 140)",
              boxShadow: "0 0 16px oklch(0.87 0.31 140 / 0.2)",
            }}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2
              className="text-lg font-bold text-foreground truncate"
              style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
            >
              {profile?.name ?? "—"}
            </h2>
            {profile?.fitnessGoal && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{
                  background: `${GOAL_COLORS[profile.fitnessGoal]}18`,
                  color: GOAL_COLORS[profile.fitnessGoal],
                }}
              >
                {GOAL_LABELS[profile.fitnessGoal]}
              </span>
            )}
            {principal && (
              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono truncate">
                {principal.slice(0, 20)}...
              </p>
            )}
          </div>

          {/* Edit button */}
          <button
            type="button"
            data-ocid="profile.edit.button"
            onClick={isEditing ? () => setIsEditing(false) : startEditing}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: isEditing
                ? "oklch(0.18 0 0)"
                : "oklch(0.87 0.31 140 / 0.15)",
              border: isEditing
                ? "1px solid oklch(0.25 0 0)"
                : "1px solid oklch(0.87 0.31 140 / 0.3)",
            }}
          >
            {isEditing ? (
              <X size={16} className="text-muted-foreground" />
            ) : (
              <Edit3 size={16} style={{ color: "oklch(0.87 0.31 140)" }} />
            )}
          </button>
        </div>

        {/* Stats row */}
        {!isEditing && profile && (
          <div className="flex gap-3 mt-4">
            {[
              { label: "Age", value: String(profile.age) },
              { label: "Height", value: `${profile.heightCm}cm` },
              { label: "Weight", value: `${profile.weightKg}kg` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 p-2 rounded-xl text-center"
                style={{ background: "oklch(0.10 0 0)" }}
              >
                <p className="text-sm font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit form */}
      {isEditing && (
        <motion.div
          data-ocid="profile.form.panel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl space-y-4"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.20 0 0)",
          }}
        >
          <p className="text-sm font-bold text-foreground">Edit Profile</p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Age</Label>
                <Input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Gender</Label>
                <Select
                  value={editGender}
                  onValueChange={(v) => setEditGender(v as Gender)}
                >
                  <SelectTrigger className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.male}>Male</SelectItem>
                    <SelectItem value={Gender.female}>Female</SelectItem>
                    <SelectItem value={Gender.other}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Height (cm)
                </Label>
                <Input
                  type="number"
                  value={editHeight}
                  onChange={(e) => setEditHeight(e.target.value)}
                  className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Weight (kg)
                </Label>
                <Input
                  type="number"
                  step={0.1}
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Fitness Goal
              </Label>
              <Select
                value={editGoal}
                onValueChange={(v) => setEditGoal(v as FitnessGoal)}
              >
                <SelectTrigger className="h-10 mt-1 bg-secondary border-border rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FitnessGoal.weightLoss}>
                    Weight Loss
                  </SelectItem>
                  <SelectItem value={FitnessGoal.muscleGain}>
                    Muscle Gain
                  </SelectItem>
                  <SelectItem value={FitnessGoal.maintainFitness}>
                    Maintain Fitness
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            data-ocid="profile.save.button"
            onClick={handleSave}
            disabled={saveProfile.isPending}
            className="w-full h-10 rounded-xl font-bold text-sm"
            style={{
              background: "oklch(0.87 0.31 140)",
              color: "oklch(0.06 0 0)",
            }}
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save size={14} />
                Save Changes
              </span>
            )}
          </Button>
        </motion.div>
      )}

      {/* Notifications */}
      <motion.div
        data-ocid="profile.notifications.panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-2xl"
        style={{
          background: "oklch(0.12 0 0)",
          border: "1px solid oklch(0.20 0 0)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Bell size={15} className="neon-text" />
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {notifications.length > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: "oklch(0.87 0.31 140)",
                color: "oklch(0.06 0 0)",
              }}
            >
              {notifications.length}
            </span>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No notifications yet.
          </p>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((notif, _i) => (
              <div
                key={String(notif.id)}
                className="p-2.5 rounded-xl"
                style={{ background: "oklch(0.10 0 0)" }}
              >
                <p className="text-xs text-foreground">{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        {/* Admin link */}
        <button
          type="button"
          onClick={onNavigateAdmin}
          className="w-full p-4 rounded-2xl flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.20 0 0)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.87 0.31 140 / 0.10)" }}
          >
            <Shield size={16} style={{ color: "oklch(0.87 0.31 140)" }} />
          </div>
          <p className="text-sm font-medium text-foreground flex-1">
            Admin Panel
          </p>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        {/* Logout */}
        <button
          type="button"
          data-ocid="profile.logout.button"
          onClick={handleLogout}
          className="w-full p-4 rounded-2xl flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
          style={{
            background: "oklch(0.12 0 0)",
            border: "1px solid oklch(0.60 0.22 25 / 0.3)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.60 0.22 25 / 0.15)" }}
          >
            <LogOut size={16} style={{ color: "#ef4444" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
            Log Out
          </p>
        </button>
      </motion.div>

      {/* Footer */}
      <div className="pb-4 pt-2 text-center">
        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon transition-colors underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
