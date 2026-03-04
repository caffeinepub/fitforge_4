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
import { ChevronRight, Ruler, Target, User, Weight } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { FitnessGoal, Gender } from "../backend.d";
import type { UserProfile } from "../backend.d";
import { useSaveUserProfile } from "../hooks/useQueries";

const steps = [
  { title: "Personal Info", icon: User },
  { title: "Body Stats", icon: Ruler },
  { title: "Your Goal", icon: Target },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>(Gender.male);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState<FitnessGoal>(FitnessGoal.maintainFitness);

  const saveProfile = useSaveUserProfile();

  const handleSubmit = async () => {
    if (!name || !age || !height || !weight) {
      toast.error("Please fill in all fields.");
      return;
    }
    const profile: UserProfile = {
      name,
      age: BigInt(Number.parseInt(age, 10)),
      gender,
      heightCm: BigInt(Number.parseInt(height, 10)),
      weightKg: Number.parseFloat(weight),
      fitnessGoal: goal,
    };
    try {
      await saveProfile.mutateAsync(profile);
      toast.success("Profile saved! Welcome to FitForge 💪");
    } catch (_err) {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const canGoNext = () => {
    if (step === 0) return name.trim().length > 0 && age.trim().length > 0;
    if (step === 1) return height.trim().length > 0 && weight.trim().length > 0;
    return true;
  };

  return (
    <div
      data-ocid="onboarding.page"
      className="app-shell flex flex-col min-h-screen"
    >
      {/* Header */}
      <div
        className="px-6 pt-12 pb-6"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.10 0 0), oklch(0.08 0 0))",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/assets/generated/fitforge-logo-transparent.dim_120x120.png"
            alt="FitForge"
            className="w-10 h-10"
          />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
            >
              Set Up Your Profile
            </h1>
            <p className="text-xs text-muted-foreground">
              Step {step + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {steps.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <div
                key={s.title}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <div
                  className="w-full h-1 rounded-full transition-all duration-500"
                  style={{
                    background:
                      i <= step ? "oklch(0.87 0.31 140)" : "oklch(0.20 0 0)",
                    boxShadow:
                      i === step
                        ? "0 0 8px oklch(0.87 0.31 140 / 0.5)"
                        : "none",
                  }}
                />
                <div className="flex items-center gap-1">
                  <StepIcon
                    size={10}
                    style={{
                      color:
                        i <= step ? "oklch(0.87 0.31 140)" : "oklch(0.40 0 0)",
                    }}
                  />
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color:
                        i <= step ? "oklch(0.87 0.31 140)" : "oklch(0.40 0 0)",
                    }}
                  >
                    {s.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Full Name *
                </Label>
                <Input
                  data-ocid="onboarding.name.input"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Age *
                </Label>
                <Input
                  data-ocid="onboarding.age.input"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={13}
                  max={100}
                  className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Gender
                </Label>
                <Select
                  value={gender}
                  onValueChange={(v) => setGender(v as Gender)}
                >
                  <SelectTrigger
                    data-ocid="onboarding.gender.select"
                    className="h-12 bg-card border-border text-foreground rounded-xl"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value={Gender.male}>Male</SelectItem>
                    <SelectItem value={Gender.female}>Female</SelectItem>
                    <SelectItem value={Gender.other}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Height (cm) *
                </Label>
                <Input
                  data-ocid="onboarding.height.input"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min={100}
                  max={250}
                  className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Weight (kg) *
                </Label>
                <Input
                  data-ocid="onboarding.weight.input"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min={30}
                  max={300}
                  step={0.1}
                  className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                />
              </div>

              {/* BMI preview */}
              {height && weight && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: "oklch(0.12 0 0)",
                    border: "1px solid oklch(0.22 0 0)",
                  }}
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    BMI Preview
                  </p>
                  <p className="text-2xl font-bold neon-text">
                    {(
                      Number.parseFloat(weight) /
                      (Number.parseFloat(height) / 100) ** 2
                    ).toFixed(1)}
                  </p>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                What&apos;s your primary fitness goal?
              </p>
              <div className="space-y-3">
                {[
                  {
                    value: FitnessGoal.weightLoss,
                    label: "Weight Loss",
                    desc: "Burn fat and lose weight",
                    emoji: "🔥",
                  },
                  {
                    value: FitnessGoal.muscleGain,
                    label: "Muscle Gain",
                    desc: "Build strength and muscle",
                    emoji: "💪",
                  },
                  {
                    value: FitnessGoal.maintainFitness,
                    label: "Maintain Fitness",
                    desc: "Stay fit and healthy",
                    emoji: "⚡",
                  },
                ].map((g) => (
                  <button
                    type="button"
                    key={g.value}
                    data-ocid={`onboarding.goal_${g.value}.toggle`}
                    onClick={() => setGoal(g.value)}
                    className="w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all duration-200"
                    style={{
                      background:
                        goal === g.value
                          ? "oklch(0.87 0.31 140 / 0.12)"
                          : "oklch(0.12 0 0)",
                      border:
                        goal === g.value
                          ? "1px solid oklch(0.87 0.31 140 / 0.5)"
                          : "1px solid oklch(0.20 0 0)",
                      boxShadow:
                        goal === g.value
                          ? "0 0 12px oklch(0.87 0.31 140 / 0.15)"
                          : "none",
                    }}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{
                          color:
                            goal === g.value
                              ? "oklch(0.87 0.31 140)"
                              : "oklch(0.90 0 0)",
                        }}
                      >
                        {g.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{g.desc}</p>
                    </div>
                    {goal === g.value && (
                      <div
                        className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "oklch(0.87 0.31 140)" }}
                      >
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="oklch(0.06 0 0)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Navigation buttons */}
      <div className="px-6 py-6 space-y-3">
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext()}
            className="w-full h-14 rounded-2xl text-base font-bold flex items-center gap-2"
            style={{
              background: canGoNext()
                ? "oklch(0.87 0.31 140)"
                : "oklch(0.20 0 0)",
              color: canGoNext() ? "oklch(0.06 0 0)" : "oklch(0.45 0 0)",
            }}
          >
            Continue
            <ChevronRight size={18} />
          </Button>
        ) : (
          <Button
            data-ocid="onboarding.submit_button"
            onClick={handleSubmit}
            disabled={saveProfile.isPending}
            className="w-full h-14 rounded-2xl text-base font-bold"
            style={{
              background: "oklch(0.87 0.31 140)",
              color: "oklch(0.06 0 0)",
              boxShadow: "0 0 24px oklch(0.87 0.31 140 / 0.4)",
            }}
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              "Start My Fitness Journey 🚀"
            )}
          </Button>
        )}
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
