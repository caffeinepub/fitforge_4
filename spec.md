# FitForge – Personal Fitness Trainer

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication (email/password login, registration, forgot password flow)
- User profile setup: name, age, gender, height, weight, fitness goal
- Dashboard with daily stats: calories burned, steps, workout duration, water intake
- Circular progress bars and weekly bar chart for progress visualization
- Motivational quote of the day (static rotating quotes)
- Fitness tracking: manual workout entry, predefined workout categories (Chest, Back, Legs, Cardio, Abs)
- Calories calculator (based on weight and workout duration)
- BMI calculator
- Simulated step counter with daily streak counter
- AI Personal Trainer module: goal-based weekly workout plan generator, exercise suggestions (sets/reps/rest), diet recommendations (veg/non-veg, calories), difficulty levels (Beginner/Intermediate/Advanced)
- Workout detail page: exercise description, start timer, mark as completed
- Progress tracking: weight log chart, weekly analytics
- Admin panel: admin login (admin@fitforge.com / Admin@123), view total/active users, manage workouts, send notifications
- Bottom navigation bar with 5 tabs: Dashboard, Workouts, AI Trainer, Progress, Profile

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

**Backend (Motoko)**
1. User profile store: create/update/get profile (name, age, gender, height, weight, fitnessGoal)
2. Workout log: add/get/list workout entries per user (category, duration, caloriesBurned, date)
3. Daily stats store: steps, waterIntake, per day per user
4. Weight log: add/list weight entries per user with timestamp
5. Predefined workouts: admin can add/edit exercises per category; public read
6. Workout plan generator: based on goal + difficulty level, return a 7-day plan
7. Admin role check: hardcoded admin principal or credential check
8. Streak counter: computed from consecutive workout log days
9. Notification store: admin creates motivational notifications; users read latest

**Frontend (React + TypeScript)**
1. Auth screens: Login, Register, Forgot Password
2. Onboarding/profile setup screen (collected after first login)
3. Dashboard screen with stat cards, circular progress bars, weekly chart, quote
4. Workouts screen: category grid, predefined exercise list, manual entry form
5. Workout detail page: exercise info, countdown timer, complete button
6. AI Trainer screen: goal/difficulty selector, generated weekly plan display, diet card
7. Progress screen: weight chart, weekly analytics cards
8. Admin panel: protected route, user list, workout management, notification sender
9. Bottom navigation: Dashboard, Workouts, AI Trainer, Progress, Profile
10. Global dark theme with neon green (#39FF14) accents throughout
