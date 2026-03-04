import { Button } from "@/components/ui/button";
import { Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  const handleLogin = () => {
    login();
  };

  if (isLoginError && loginError) {
    toast.error(loginError.message || "Login failed. Please try again.");
  }

  return (
    <div
      data-ocid="login.page"
      className="app-shell flex flex-col min-h-screen relative overflow-hidden"
    >
      {/* Background atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.87 0.31 140 / 0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(0.25 0 0 / 0.4) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 relative"
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center relative overflow-hidden"
            style={{
              background: "oklch(0.12 0 0)",
              border: "1px solid oklch(0.87 0.31 140 / 0.3)",
              boxShadow: "0 0 30px oklch(0.87 0.31 140 / 0.2)",
            }}
          >
            <img
              src="/assets/generated/fitforge-logo-transparent.dim_120x120.png"
              alt="FitForge Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-center mb-3"
        >
          <h1
            className="text-4xl font-bold tracking-tight mb-1"
            style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
          >
            <span className="text-foreground">Fit</span>
            <span className="neon-text">Forge</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
            Personal Fitness Trainer
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-center text-muted-foreground text-sm mb-10 max-w-xs leading-relaxed"
        >
          Your AI-powered gym companion. Build strength, track progress, and
          crush your goals.
        </motion.p>

        {/* Hero image strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full mb-10 overflow-hidden rounded-2xl"
          style={{ border: "1px solid oklch(0.22 0 0)" }}
        >
          <img
            src="/assets/generated/fitforge-hero.dim_800x300.jpg"
            alt="FitForge Hero"
            className="w-full h-36 object-cover"
          />
        </motion.div>

        {/* Feature badges */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex flex-wrap gap-2 justify-center mb-10"
        >
          {[
            "AI Workout Plans",
            "Calorie Tracking",
            "Progress Charts",
            "BMI Calculator",
          ].map((feat) => (
            <span
              key={feat}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.22 0 0)",
                color: "oklch(0.70 0 0)",
              }}
            >
              {feat}
            </span>
          ))}
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full space-y-3"
        >
          <Button
            data-ocid="login.submit_button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-bold rounded-2xl relative overflow-hidden"
            style={{
              background: isLoggingIn
                ? "oklch(0.65 0.25 140)"
                : "oklch(0.87 0.31 140)",
              color: "oklch(0.06 0 0)",
              boxShadow: isLoggingIn
                ? "none"
                : "0 0 24px oklch(0.87 0.31 140 / 0.4)",
            }}
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield size={18} />
                Connect with Internet Identity
              </span>
            )}
          </Button>

          <p
            data-ocid="login.forgot_password.link"
            className="text-center text-xs text-muted-foreground"
          >
            Secure authentication powered by Internet Computer
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pb-8 px-6 text-center"
      >
        <p className="text-xs text-muted-foreground/60">
          <span data-ocid="login.register.link">
            New here? Connect to create your account automatically.
          </span>
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <Zap size={12} className="neon-text" />
          <p className="text-xs text-muted-foreground/40">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neon transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
