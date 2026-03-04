import { BarChart2, Dumbbell, Home, User, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { AppTab } from "../App";

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "ai_trainer", label: "AI Trainer", icon: Zap },
  { id: "progress", label: "Progress", icon: BarChart2 },
  { id: "profile", label: "Profile", icon: User },
];

const OCID_MAP: Record<AppTab, string> = {
  dashboard: "nav.dashboard.link",
  workouts: "nav.workouts.link",
  ai_trainer: "nav.ai_trainer.link",
  progress: "nav.progress.link",
  profile: "nav.profile.link",
};

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{
        background: "oklch(0.10 0 0)",
        borderTop: "1px solid oklch(0.20 0 0)",
      }}
    >
      <div className="flex items-center justify-around h-[68px] px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={OCID_MAP[tab.id]}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-0.5 flex-1 py-2 relative group"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full tab-active-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Icon
                  size={22}
                  className="transition-colors duration-200"
                  style={{
                    color: isActive
                      ? "oklch(0.87 0.31 140)"
                      : "oklch(0.50 0 0)",
                    filter: isActive
                      ? "drop-shadow(0 0 6px oklch(0.87 0.31 140 / 0.5))"
                      : "none",
                  }}
                />
              </motion.div>
              <span
                className="text-[10px] font-medium transition-colors duration-200"
                style={{
                  color: isActive ? "oklch(0.87 0.31 140)" : "oklch(0.45 0 0)",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
