import { DifficultyLevel, FitnessGoal } from "../backend.d";

export interface PlanExercise {
  name: string;
  sets: number;
  reps: string;
  rest: number; // seconds
  notes?: string;
}

export interface PlanDay {
  day: number;
  title: string;
  focus: string;
  exercises: PlanExercise[];
  isRest: boolean;
}

export interface WorkoutPlanTemplate {
  goal: FitnessGoal;
  difficulty: DifficultyLevel;
  days: PlanDay[];
}

const WEIGHT_LOSS_BEGINNER: WorkoutPlanTemplate = {
  goal: FitnessGoal.weightLoss,
  difficulty: DifficultyLevel.beginner,
  days: [
    {
      day: 1,
      title: "Cardio Kickstart",
      focus: "Cardio",
      isRest: false,
      exercises: [
        { name: "Brisk Walk/Jog", sets: 1, reps: "30 min", rest: 60 },
        { name: "Jumping Jacks", sets: 3, reps: "20", rest: 30 },
        { name: "High Knees", sets: 3, reps: "30 sec", rest: 30 },
      ],
    },
    {
      day: 2,
      title: "Full Body Circuit",
      focus: "Full Body",
      isRest: false,
      exercises: [
        { name: "Bodyweight Squats", sets: 3, reps: "12", rest: 45 },
        { name: "Push-ups (Modified)", sets: 3, reps: "10", rest: 45 },
        { name: "Glute Bridges", sets: 3, reps: "12", rest: 45 },
        { name: "Plank Hold", sets: 3, reps: "20 sec", rest: 30 },
      ],
    },
    {
      day: 3,
      title: "Active Recovery",
      focus: "Rest & Stretch",
      isRest: true,
      exercises: [
        { name: "Yoga Stretching", sets: 1, reps: "20 min", rest: 0 },
        { name: "Light Walk", sets: 1, reps: "15 min", rest: 0 },
      ],
    },
    {
      day: 4,
      title: "Cardio Intervals",
      focus: "Cardio",
      isRest: false,
      exercises: [
        {
          name: "Interval Run (jog/sprint)",
          sets: 5,
          reps: "2 min each",
          rest: 60,
        },
        { name: "Jump Rope", sets: 3, reps: "1 min", rest: 45 },
        { name: "Mountain Climbers", sets: 3, reps: "20", rest: 30 },
      ],
    },
    {
      day: 5,
      title: "Upper Body",
      focus: "Upper Body",
      isRest: false,
      exercises: [
        { name: "Push-ups", sets: 3, reps: "15", rest: 45 },
        { name: "Dumbbell Rows", sets: 3, reps: "12", rest: 45 },
        { name: "Shoulder Press", sets: 3, reps: "12", rest: 45 },
        { name: "Bicep Curls", sets: 3, reps: "12", rest: 30 },
      ],
    },
    {
      day: 6,
      title: "Lower Body Burn",
      focus: "Legs",
      isRest: false,
      exercises: [
        { name: "Lunges", sets: 3, reps: "12 each side", rest: 45 },
        { name: "Wall Sit", sets: 3, reps: "30 sec", rest: 45 },
        { name: "Calf Raises", sets: 3, reps: "20", rest: 30 },
        { name: "Donkey Kicks", sets: 3, reps: "15 each side", rest: 30 },
      ],
    },
    {
      day: 7,
      title: "Rest Day",
      focus: "Recovery",
      isRest: true,
      exercises: [
        { name: "Light Stretching", sets: 1, reps: "10 min", rest: 0 },
      ],
    },
  ],
};

const MUSCLE_GAIN_INTERMEDIATE: WorkoutPlanTemplate = {
  goal: FitnessGoal.muscleGain,
  difficulty: DifficultyLevel.intermediate,
  days: [
    {
      day: 1,
      title: "Chest & Triceps",
      focus: "Push",
      isRest: false,
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8–10", rest: 90 },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10", rest: 75 },
        { name: "Cable Flyes", sets: 3, reps: "12", rest: 60 },
        { name: "Tricep Dips", sets: 3, reps: "12", rest: 60 },
        { name: "Overhead Tricep Extension", sets: 3, reps: "12", rest: 60 },
      ],
    },
    {
      day: 2,
      title: "Back & Biceps",
      focus: "Pull",
      isRest: false,
      exercises: [
        { name: "Pull-ups / Lat Pulldown", sets: 4, reps: "8", rest: 90 },
        { name: "Bent-Over Barbell Row", sets: 4, reps: "8–10", rest: 90 },
        { name: "Seated Cable Row", sets: 3, reps: "12", rest: 60 },
        { name: "Barbell Bicep Curls", sets: 3, reps: "10", rest: 60 },
        { name: "Hammer Curls", sets: 3, reps: "12", rest: 60 },
      ],
    },
    {
      day: 3,
      title: "Leg Day",
      focus: "Legs",
      isRest: false,
      exercises: [
        { name: "Barbell Squat", sets: 4, reps: "8", rest: 120 },
        { name: "Romanian Deadlift", sets: 3, reps: "10", rest: 90 },
        { name: "Leg Press", sets: 3, reps: "12", rest: 75 },
        { name: "Leg Curls", sets: 3, reps: "12", rest: 60 },
        { name: "Calf Raises", sets: 4, reps: "15", rest: 45 },
      ],
    },
    {
      day: 4,
      title: "Shoulders & Abs",
      focus: "Shoulders",
      isRest: false,
      exercises: [
        { name: "Overhead Press", sets: 4, reps: "8", rest: 90 },
        { name: "Lateral Raises", sets: 3, reps: "12–15", rest: 60 },
        { name: "Front Raises", sets: 3, reps: "12", rest: 60 },
        { name: "Cable Crunches", sets: 3, reps: "15", rest: 45 },
        { name: "Plank", sets: 3, reps: "45 sec", rest: 45 },
      ],
    },
    {
      day: 5,
      title: "Chest & Triceps",
      focus: "Push",
      isRest: false,
      exercises: [
        { name: "Dumbbell Bench Press", sets: 4, reps: "10", rest: 90 },
        { name: "Push-ups", sets: 3, reps: "15", rest: 60 },
        { name: "Pec Deck Fly", sets: 3, reps: "12", rest: 60 },
        { name: "Close-Grip Press", sets: 3, reps: "10", rest: 75 },
        { name: "Tricep Pushdown", sets: 3, reps: "12", rest: 60 },
      ],
    },
    {
      day: 6,
      title: "Back & Biceps",
      focus: "Pull",
      isRest: false,
      exercises: [
        { name: "Deadlift", sets: 4, reps: "5", rest: 120 },
        { name: "One-Arm Dumbbell Row", sets: 3, reps: "10 each", rest: 75 },
        { name: "Face Pulls", sets: 3, reps: "15", rest: 60 },
        { name: "Concentration Curls", sets: 3, reps: "12", rest: 60 },
        { name: "Reverse Curls", sets: 3, reps: "12", rest: 60 },
      ],
    },
    {
      day: 7,
      title: "Rest & Recovery",
      focus: "Recovery",
      isRest: true,
      exercises: [
        { name: "Foam Rolling", sets: 1, reps: "15 min", rest: 0 },
        { name: "Mobility Work", sets: 1, reps: "10 min", rest: 0 },
      ],
    },
  ],
};

const MAINTAIN_FITNESS_INTERMEDIATE: WorkoutPlanTemplate = {
  goal: FitnessGoal.maintainFitness,
  difficulty: DifficultyLevel.intermediate,
  days: [
    {
      day: 1,
      title: "Total Body Strength",
      focus: "Full Body",
      isRest: false,
      exercises: [
        { name: "Goblet Squat", sets: 3, reps: "12", rest: 60 },
        { name: "Push-ups", sets: 3, reps: "15", rest: 60 },
        { name: "Dumbbell Row", sets: 3, reps: "12 each", rest: 60 },
        { name: "Romanian Deadlift", sets: 3, reps: "10", rest: 75 },
        { name: "Shoulder Press", sets: 3, reps: "12", rest: 60 },
      ],
    },
    {
      day: 2,
      title: "Cardio & Core",
      focus: "Cardio",
      isRest: false,
      exercises: [
        { name: "Moderate Jog", sets: 1, reps: "20 min", rest: 0 },
        { name: "Bicycle Crunches", sets: 3, reps: "20", rest: 30 },
        { name: "Russian Twists", sets: 3, reps: "20", rest: 30 },
        { name: "Leg Raises", sets: 3, reps: "15", rest: 30 },
      ],
    },
    {
      day: 3,
      title: "Active Rest",
      focus: "Mobility",
      isRest: true,
      exercises: [
        { name: "Yoga Flow", sets: 1, reps: "25 min", rest: 0 },
        { name: "Light Cycling", sets: 1, reps: "15 min", rest: 0 },
      ],
    },
    {
      day: 4,
      title: "Upper Body Focus",
      focus: "Upper Body",
      isRest: false,
      exercises: [
        { name: "Bench Press", sets: 3, reps: "10", rest: 75 },
        { name: "Lat Pulldown", sets: 3, reps: "12", rest: 60 },
        { name: "Lateral Raises", sets: 3, reps: "15", rest: 45 },
        { name: "Bicep Curls", sets: 3, reps: "12", rest: 45 },
        { name: "Tricep Extension", sets: 3, reps: "12", rest: 45 },
      ],
    },
    {
      day: 5,
      title: "Lower Body Focus",
      focus: "Legs",
      isRest: false,
      exercises: [
        { name: "Squat", sets: 3, reps: "12", rest: 75 },
        { name: "Walking Lunges", sets: 3, reps: "10 each", rest: 60 },
        { name: "Leg Press", sets: 3, reps: "12", rest: 60 },
        { name: "Hip Thrusts", sets: 3, reps: "15", rest: 60 },
        { name: "Standing Calf Raises", sets: 3, reps: "20", rest: 30 },
      ],
    },
    {
      day: 6,
      title: "Functional Fitness",
      focus: "Functional",
      isRest: false,
      exercises: [
        { name: "Burpees", sets: 3, reps: "10", rest: 60 },
        { name: "Box Jumps", sets: 3, reps: "10", rest: 60 },
        { name: "Kettlebell Swings", sets: 3, reps: "15", rest: 60 },
        { name: "TRX Rows", sets: 3, reps: "12", rest: 45 },
        { name: "Medicine Ball Slams", sets: 3, reps: "10", rest: 45 },
      ],
    },
    {
      day: 7,
      title: "Rest Day",
      focus: "Recovery",
      isRest: true,
      exercises: [
        { name: "Light Stretching", sets: 1, reps: "15 min", rest: 0 },
      ],
    },
  ],
};

const WEIGHT_LOSS_ADVANCED: WorkoutPlanTemplate = {
  goal: FitnessGoal.weightLoss,
  difficulty: DifficultyLevel.advanced,
  days: [
    {
      day: 1,
      title: "HIIT Blast",
      focus: "Cardio",
      isRest: false,
      exercises: [
        {
          name: "Sprints (30s on/30s off)",
          sets: 10,
          reps: "30 sec",
          rest: 30,
        },
        { name: "Burpees", sets: 4, reps: "15", rest: 30 },
        { name: "Box Jumps", sets: 4, reps: "12", rest: 45 },
        { name: "Battle Ropes", sets: 4, reps: "40 sec", rest: 20 },
      ],
    },
    {
      day: 2,
      title: "Strength Circuit",
      focus: "Full Body",
      isRest: false,
      exercises: [
        { name: "Barbell Squat", sets: 4, reps: "15", rest: 45 },
        { name: "Pull-ups", sets: 4, reps: "12", rest: 45 },
        { name: "Dumbbell Press", sets: 4, reps: "15", rest: 45 },
        { name: "Deadlift", sets: 3, reps: "12", rest: 60 },
      ],
    },
    {
      day: 3,
      title: "Active Recovery",
      focus: "Mobility",
      isRest: true,
      exercises: [
        { name: "Swimming / Cycling", sets: 1, reps: "30 min light", rest: 0 },
      ],
    },
    {
      day: 4,
      title: "Metabolic Conditioning",
      focus: "Cardio",
      isRest: false,
      exercises: [
        { name: "Rowing Machine", sets: 5, reps: "500m", rest: 90 },
        { name: "Sled Push", sets: 4, reps: "20m", rest: 90 },
        { name: "Treadmill Incline Walk", sets: 1, reps: "15 min", rest: 0 },
      ],
    },
    {
      day: 5,
      title: "Upper Body Strength",
      focus: "Upper Body",
      isRest: false,
      exercises: [
        { name: "Incline Press", sets: 4, reps: "12", rest: 60 },
        { name: "Weighted Pull-ups", sets: 4, reps: "8", rest: 75 },
        { name: "Cable Row", sets: 3, reps: "15", rest: 60 },
        { name: "Arnold Press", sets: 3, reps: "12", rest: 60 },
      ],
    },
    {
      day: 6,
      title: "Lower Body & Core",
      focus: "Legs & Core",
      isRest: false,
      exercises: [
        { name: "Bulgarian Split Squat", sets: 4, reps: "10 each", rest: 75 },
        { name: "Romanian Deadlift", sets: 4, reps: "12", rest: 75 },
        { name: "Hanging Leg Raises", sets: 4, reps: "15", rest: 45 },
        { name: "Ab Wheel Rollouts", sets: 3, reps: "12", rest: 45 },
      ],
    },
    {
      day: 7,
      title: "Complete Rest",
      focus: "Rest",
      isRest: true,
      exercises: [
        { name: "Light Stretching", sets: 1, reps: "10 min", rest: 0 },
      ],
    },
  ],
};

const MUSCLE_GAIN_BEGINNER: WorkoutPlanTemplate = {
  goal: FitnessGoal.muscleGain,
  difficulty: DifficultyLevel.beginner,
  days: [
    {
      day: 1,
      title: "Full Body A",
      focus: "Full Body",
      isRest: false,
      exercises: [
        { name: "Bodyweight Squat", sets: 3, reps: "10", rest: 60 },
        { name: "Push-ups", sets: 3, reps: "8–10", rest: 60 },
        { name: "Assisted Pull-up/Lat Pulldown", sets: 3, reps: "8", rest: 75 },
        { name: "Plank", sets: 3, reps: "20 sec", rest: 30 },
      ],
    },
    {
      day: 2,
      title: "Rest",
      focus: "Recovery",
      isRest: true,
      exercises: [
        { name: "Light Stretching", sets: 1, reps: "10 min", rest: 0 },
      ],
    },
    {
      day: 3,
      title: "Full Body B",
      focus: "Full Body",
      isRest: false,
      exercises: [
        { name: "Dumbbell Lunges", sets: 3, reps: "10 each", rest: 60 },
        { name: "Dumbbell Row", sets: 3, reps: "10", rest: 60 },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10", rest: 60 },
        { name: "Bicycle Crunches", sets: 3, reps: "15", rest: 30 },
      ],
    },
    {
      day: 4,
      title: "Rest",
      focus: "Recovery",
      isRest: true,
      exercises: [
        { name: "Walk / Light Yoga", sets: 1, reps: "20 min", rest: 0 },
      ],
    },
    {
      day: 5,
      title: "Full Body C",
      focus: "Full Body",
      isRest: false,
      exercises: [
        { name: "Goblet Squat", sets: 3, reps: "10", rest: 60 },
        { name: "Incline Push-ups", sets: 3, reps: "12", rest: 60 },
        { name: "Seated Cable Row", sets: 3, reps: "10", rest: 60 },
        { name: "Dead Bug", sets: 3, reps: "10 each", rest: 45 },
      ],
    },
    {
      day: 6,
      title: "Light Cardio",
      focus: "Cardio",
      isRest: false,
      exercises: [
        { name: "Brisk Walk", sets: 1, reps: "20 min", rest: 0 },
        { name: "Jumping Jacks", sets: 2, reps: "20", rest: 30 },
      ],
    },
    {
      day: 7,
      title: "Rest Day",
      focus: "Recovery",
      isRest: true,
      exercises: [{ name: "Full Rest", sets: 1, reps: "—", rest: 0 }],
    },
  ],
};

const ALL_TEMPLATES: WorkoutPlanTemplate[] = [
  WEIGHT_LOSS_BEGINNER,
  WEIGHT_LOSS_ADVANCED,
  MUSCLE_GAIN_BEGINNER,
  MUSCLE_GAIN_INTERMEDIATE,
  MAINTAIN_FITNESS_INTERMEDIATE,
];

export function getWorkoutPlanTemplate(
  goal: FitnessGoal,
  difficulty: DifficultyLevel,
): WorkoutPlanTemplate {
  // Find exact match first
  const exact = ALL_TEMPLATES.find(
    (t) => t.goal === goal && t.difficulty === difficulty,
  );
  if (exact) return exact;

  // Find by goal
  const byGoal = ALL_TEMPLATES.find((t) => t.goal === goal);
  if (byGoal) return byGoal;

  // Default
  return WEIGHT_LOSS_BEGINNER;
}

export const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success starts with self-discipline.",
  "The pain you feel today is the strength you feel tomorrow.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "The harder you work, the luckier you get.",
  "Strive for progress, not perfection.",
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

export function calculateBMI(
  weightKg: number,
  heightCm: number,
): { value: number; category: string; color: string } {
  if (heightCm <= 0 || weightKg <= 0)
    return { value: 0, category: "N/A", color: "#9ca3af" };
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const value = Math.round(bmi * 10) / 10;
  let category = "Normal";
  let color = "#39FF14";
  if (bmi < 18.5) {
    category = "Underweight";
    color = "#60a5fa";
  } else if (bmi < 25) {
    category = "Normal";
    color = "#39FF14";
  } else if (bmi < 30) {
    category = "Overweight";
    color = "#f59e0b";
  } else {
    category = "Obese";
    color = "#ef4444";
  }
  return { value, category, color };
}

export function calculateCalories(
  weightKg: number,
  durationMin: number,
  met = 5,
): number {
  return Math.round(weightKg * durationMin * 0.0175 * met);
}

export function calculateDailyCalories(
  weightKg: number,
  goal: FitnessGoal,
): number {
  const bmr = 10 * weightKg + 500; // Simplified Mifflin-St Jeor
  if (goal === FitnessGoal.weightLoss) return Math.round(bmr * 1.3);
  if (goal === FitnessGoal.muscleGain) return Math.round(bmr * 1.7);
  return Math.round(bmr * 1.5);
}

export function computeStreak(logs: Array<{ date: string }>): number {
  if (!logs.length) return 0;
  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  const today = getTodayDateStr();
  let streak = 0;
  let current = new Date(today);
  for (const date of uniqueDates) {
    const d = new Date(date);
    const diff = Math.round((current.getTime() - d.getTime()) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      current = d;
    } else {
      break;
    }
  }
  return streak;
}

function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}
