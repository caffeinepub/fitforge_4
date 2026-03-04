import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Type Definitions
  type Gender = { #male; #female; #other };
  type FitnessGoal = { #weightLoss; #muscleGain; #maintainFitness };
  type DifficultyLevel = { #beginner; #intermediate; #advanced };
  type WorkoutCategory = {
    #chest;
    #back;
    #legs;
    #cardio;
    #abs;
    #custom;
  };
  type DietType = { #veg; #nonVeg };

  type UserProfile = {
    name : Text;
    age : Nat;
    gender : Gender;
    heightCm : Nat;
    weightKg : Float;
    fitnessGoal : FitnessGoal;
  };

  type WorkoutLog = {
    id : Nat;
    category : WorkoutCategory;
    exerciseName : Text;
    durationMinutes : Nat;
    caloriesBurned : Nat;
    date : Text;
  };

  type DailyStats = {
    date : Text;
    stepsCount : Nat;
    waterIntakeMl : Nat;
  };

  type WeightEntry = {
    id : Nat;
    weightKg : Float;
    date : Text;
  };

  type Exercise = {
    id : Nat;
    category : WorkoutCategory;
    name : Text;
    description : Text;
    setsRecommended : Nat;
    repsRecommended : Nat;
    restSeconds : Nat;
    difficultyLevel : DifficultyLevel;
    imageUrl : ?Storage.ExternalBlob;
  };

  type WorkoutPlan = {
    goal : FitnessGoal;
    difficultyLevel : DifficultyLevel;
    planJson : Text;
    createdAt : Time.Time;
  };

  type DietRecommendation = {
    dietType : DietType;
    dailyCaloriesRequired : Nat;
    planJson : Text;
    createdAt : Time.Time;
  };

  type Notification = {
    id : Nat;
    message : Text;
    createdAt : Time.Time;
  };

  // Storage
  let profiles = Map.empty<Principal, UserProfile>();
  let workoutLogs = Map.empty<Principal, List.List<WorkoutLog>>();
  let dailyStats = Map.empty<Principal, Map.Map<Text, DailyStats>>();
  let weightEntries = Map.empty<Principal, List.List<WeightEntry>>();
  let exercises = Map.empty<Nat, Exercise>();
  let workoutPlans = Map.empty<Principal, WorkoutPlan>();
  let dietRecommendations = Map.empty<Principal, DietRecommendation>();
  let notifications = Map.empty<Nat, Notification>();
  var nextId = 1;

  // Utility Functions
  func getNextId() : Nat {
    let id = nextId;
    nextId += 1;
    id;
  };

  // Notification Sorting Function
  module Notification {
    public func compare(a : Notification, b : Notification) : Order.Order {
      Nat.compare(b.id, a.id);
    };
  };

  // User Profile Management
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access other users' profiles");
    };
    switch (profiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  // Workout Log Management
  public query ({ caller }) func getCallerWorkoutLogs() : async [WorkoutLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access workout logs");
    };
    switch (workoutLogs.get(caller)) {
      case (null) { [] };
      case (?logList) { logList.toArray() };
    };
  };

  public shared ({ caller }) func logWorkout(category : WorkoutCategory, exercise : Text, duration : Nat, calories : Nat, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log workouts");
    };
    let log = {
      id = getNextId();
      category;
      exerciseName = exercise;
      durationMinutes = duration;
      caloriesBurned = calories;
      date;
    };

    let logsList = switch (workoutLogs.get(caller)) {
      case (null) { List.empty<WorkoutLog>() };
      case (?existing) { existing };
    };
    logsList.add(log);
    workoutLogs.add(caller, logsList);
  };

  public shared ({ caller }) func deleteWorkoutLog(logId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify workout logs");
    };
    switch (workoutLogs.get(caller)) {
      case (null) { Runtime.trap("No workout logs found") };
      case (?existing) {
        let filtered = existing.filter(func(log) { log.id != logId });
        workoutLogs.add(caller, filtered);
      };
    };
  };

  // Daily Stats Management
  public shared ({ caller }) func addOrUpdateCallerDailyStats(date : Text, steps : Nat, water : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage daily stats");
    };
    let userStats = switch (dailyStats.get(caller)) {
      case (null) { Map.empty<Text, DailyStats>() };
      case (?existing) { existing };
    };

    let stats = {
      date;
      stepsCount = steps;
      waterIntakeMl = water;
    };

    userStats.add(date, stats);
    dailyStats.add(caller, userStats);
  };

  public query ({ caller }) func getCallerDailyStats(date : Text) : async DailyStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access daily stats");
    };
    switch (dailyStats.get(caller)) {
      case (null) { Runtime.trap("No stats found") };
      case (?userStats) {
        switch (userStats.get(date)) {
          case (null) { Runtime.trap("Stats not found") };
          case (?stats) { stats };
        };
      };
    };
  };

  // Weight Log Management
  public shared ({ caller }) func addCallerWeightEntry(weightKg : Float, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage weight entries");
    };
    let entry = {
      id = getNextId();
      weightKg;
      date;
    };

    let entriesList = switch (weightEntries.get(caller)) {
      case (null) { List.empty<WeightEntry>() };
      case (?existing) { existing };
    };
    entriesList.add(entry);
    weightEntries.add(caller, entriesList);
  };

  public query ({ caller }) func getCallerWeightEntries() : async [WeightEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access weight entries");
    };
    switch (weightEntries.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  // Exercise Library Management
  public shared ({ caller }) func createExercise(
    category : WorkoutCategory,
    name : Text,
    description : Text,
    setsRec : Nat,
    repsRec : Nat,
    restSecs : Nat,
    difficulty : DifficultyLevel,
    imageUrl : ?Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage exercises");
    };
    let exercise = {
      id = getNextId();
      category;
      name;
      description;
      setsRecommended = setsRec;
      repsRecommended = repsRec;
      restSeconds = restSecs;
      difficultyLevel = difficulty;
      imageUrl;
    };
    exercises.add(exercise.id, exercise);
  };

  public shared ({ caller }) func updateExercise(exercise : Exercise) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage exercises");
    };
    exercises.add(exercise.id, exercise);
  };

  public shared ({ caller }) func deleteExercise(exerciseId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage exercises");
    };
    exercises.remove(exerciseId);
  };

  public query func getExercisesByCategory(category : WorkoutCategory) : async [Exercise] {
    // No authorization check - anyone can list exercises per spec
    exercises.values().toArray().filter(func(e) { e.category == category });
  };

  // Workout Plans Management
  public shared ({ caller }) func saveCallerWorkoutPlan(goal : FitnessGoal, difficulty : DifficultyLevel, planJson : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage workout plans");
    };
    let plan = {
      goal;
      difficultyLevel = difficulty;
      planJson;
      createdAt = Time.now();
    };
    workoutPlans.add(caller, plan);
  };

  public query ({ caller }) func getCallerWorkoutPlan() : async WorkoutPlan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access workout plans");
    };
    switch (workoutPlans.get(caller)) {
      case (null) { Runtime.trap("No plan found") };
      case (?plan) { plan };
    };
  };

  // Diet Recommendations Management
  public shared ({ caller }) func saveCallerDietRecommendation(dietType : DietType, dailyCalories : Nat, planJson : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage diet recommendations");
    };
    let recommendation = {
      dietType;
      dailyCaloriesRequired = dailyCalories;
      planJson;
      createdAt = Time.now();
    };
    dietRecommendations.add(caller, recommendation);
  };

  public query ({ caller }) func getCallerDietRecommendation() : async DietRecommendation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access diet recommendations");
    };
    switch (dietRecommendations.get(caller)) {
      case (null) { Runtime.trap("No recommendation found") };
      case (?rec) { rec };
    };
  };

  // Notifications Management
  public shared ({ caller }) func createNotification(message : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can manage notifications");
    };
    let notification = {
      id = getNextId();
      message;
      createdAt = Time.now();
    };
    notifications.add(notification.id, notification);
  };

  public query func getLatestNotifications() : async [Notification] {
    // No authorization check - anyone can view motivational notifications
    let sorted = notifications.values().toArray().sort();
    let limit = Nat.min(10, sorted.size());
    Array.tabulate<Notification>(limit, func(i) { sorted[i] });
  };

  // Admin Functions
  public query ({ caller }) func getUserCount() : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access user count");
    };
    profiles.size();
  };

  public query ({ caller }) func getAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can access all user profiles");
    };
    profiles.toArray();
  };
};
