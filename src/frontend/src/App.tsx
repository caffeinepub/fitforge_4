import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserProfile } from "./hooks/useQueries";

import BottomNav from "./components/BottomNav";
import AITrainerScreen from "./screens/AITrainerScreen";
import AdminScreen from "./screens/AdminScreen";
import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ProgressScreen from "./screens/ProgressScreen";
import WorkoutsScreen from "./screens/WorkoutsScreen";

export type AppTab =
  | "dashboard"
  | "workouts"
  | "ai_trainer"
  | "progress"
  | "profile";

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorLoading } = useActor();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile();

  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [_isAdmin, setIsAdmin] = useState(false);

  // Check for admin route
  const isAdminRoute =
    window.location.hash === "#/admin" || window.location.pathname === "/admin";

  useEffect(() => {
    const checkAdmin = async () => {
      if (actor && !actorLoading) {
        try {
          const admin = await actor.isCallerAdmin();
          setIsAdmin(admin);
        } catch {
          setIsAdmin(false);
        }
      }
    };
    void checkAdmin();
  }, [actor, actorLoading]);

  // Loading state while initializing
  if (isInitializing || (identity && actorLoading)) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/fitforge-logo-transparent.dim_120x120.png"
            alt="FitForge"
            className="w-20 h-20 animate-pulse"
          />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-neon animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!identity) {
    return <LoginScreen />;
  }

  // Profile loading
  if (profileLoading) {
    return (
      <div className="app-shell flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/fitforge-logo-transparent.dim_120x120.png"
            alt="FitForge"
            className="w-16 h-16"
          />
          <p className="text-muted-foreground text-sm">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Profile error or incomplete — show onboarding
  const needsOnboarding = profileError || !profile || !profile.name;
  if (needsOnboarding) {
    return <OnboardingScreen />;
  }

  // Admin panel
  if (isAdminRoute) {
    return <AdminScreen />;
  }

  return (
    <div className="app-shell">
      <main className="pb-nav min-h-screen">
        {activeTab === "dashboard" && <DashboardScreen />}
        {activeTab === "workouts" && <WorkoutsScreen />}
        {activeTab === "ai_trainer" && <AITrainerScreen />}
        {activeTab === "progress" && <ProgressScreen />}
        {activeTab === "profile" && (
          <ProfileScreen
            onNavigateAdmin={() => {
              window.location.hash = "#/admin";
              window.location.reload();
            }}
          />
        )}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.14 0 0)",
            border: "1px solid oklch(0.22 0 0)",
            color: "oklch(0.97 0 0)",
          },
        }}
      />
    </>
  );
}
