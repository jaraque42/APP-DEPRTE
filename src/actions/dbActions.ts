"use server";

import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import WorkoutPlan from "@/lib/models/WorkoutPlan";
import FoodLibrary from "@/lib/models/FoodLibrary";
import DailyLog from "@/lib/models/DailyLog";
import FoodLog from "@/lib/models/FoodLog";

import bcrypt from "bcryptjs";

// Auth methods
export async function registerMongoUser(email: string, password: string) {
    try {
        await connectToDatabase();
        const existing = await User.findOne({ email });
        if (existing) return { error: "Email already registered" };

        const passwordHash = await bcrypt.hash(password, 10);
        const name = email.split("@")[0];
        const newUser = await User.create({ email, passwordHash, name });
        return { success: true, user: JSON.parse(JSON.stringify(newUser)) };
    } catch (e: any) {
        return { error: e.message || "Database connection error" };
    }
}

// User Profile
export async function getMongoUserDoc(userId: string) {
    await connectToDatabase();
    const user = await User.findById(userId);
    return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function finishMongoOnboarding(userId: string, profileData: any) {
    await connectToDatabase();
    
    // Calcula TDEE
    const w = parseFloat(profileData.weight_kg);
    const h = parseFloat(profileData.height_cm);
    const a = parseInt(profileData.age);
    const g = profileData.gender;
    let bmr = g === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    let tdee = bmr * profileData.activity_level;

    let target_kcal = profileData.targetKcal;
    if (!target_kcal) {
        target_kcal = tdee;
        if (profileData.goal === 'fat_loss') target_kcal -= 500;
        if (profileData.goal === 'muscle_gain') target_kcal += 300;
        target_kcal = Math.round(target_kcal);
    }
    const p = Math.round((w * 2.2));
    const f = Math.round((w * 1));
    const c = Math.round((target_kcal - (p * 4) - (f * 9)) / 4);

    await User.findByIdAndUpdate(userId, {
        age: profileData.age,
        weight_kg: profileData.weight_kg,
        height_cm: profileData.height_cm,
        gender: profileData.gender,
        activity_level: profileData.activity_level,
        goal_type: profileData.goal,
        target_kcal,
        target_protein: p,
        target_carbs: c,
        target_fats: f,
        onboarding_complete: true
    });

    if (profileData.routineDays && profileData.routineDays.length > 0) {
        await WorkoutPlan.create({
            user_id: userId,
            routine_id: profileData.routineCategory,
            category: profileData.routineCategory.toLowerCase(),
            level: profileData.routineLevel,
            days: profileData.routineDays,
            duration_weeks: 4
        });
    }

    return true;
}

export async function updateMongoUserMacros(userId: string, macros: { kcal: number, p: number, c: number, f: number }) {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, {
        target_kcal: macros.kcal,
        target_protein: macros.p,
        target_carbs: macros.c,
        target_fats: macros.f
    });
    return true;
}

// Workouts
export async function saveMongoWorkoutPlan(userId: string, planData: any) {
    await connectToDatabase();
    const plan = await WorkoutPlan.create({ user_id: userId, ...planData });
    return JSON.parse(JSON.stringify(plan));
}

export async function getMongoWorkoutPlans(userId: string) {
    await connectToDatabase();
    const plans = await WorkoutPlan.find({ user_id: userId });
    return JSON.parse(JSON.stringify(plans));
}

export async function deleteMongoWorkoutPlan(userId: string, category: string, level: string) {
    await connectToDatabase();
    await WorkoutPlan.deleteMany({ user_id: userId, category, level });
    return { success: true };
}

// Food Library & Logs
export async function searchMongoFoodLibrary(query: string) {
    await connectToDatabase();
    if (!query || query.trim() === "") {
        const foods = await FoodLibrary.find().limit(10);
        return JSON.parse(JSON.stringify(foods));
    }
    const regex = new RegExp(query, 'i');
    const foods = await FoodLibrary.find({ name: regex }).limit(5);
    return JSON.parse(JSON.stringify(foods));
}

export async function addMongoFoodToLibrary(foodData: any) {
    await connectToDatabase();
    const food = await FoodLibrary.create(foodData);
    return JSON.parse(JSON.stringify(food));
}

export async function logMongoFoodEntry(userId: string, food: any, amount: number, mealType: string) {
    await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];
    const multiplier = amount / 100;
    const kc = food.kcal_per_100g * multiplier;
    const p = food.protein_per_100g * multiplier;
    const c = food.carbs_per_100g * multiplier;
    const f = food.fat_per_100g * multiplier;

    const log = await FoodLog.create({
        user_id: userId,
        food_library: food.id || food._id,
        food_name: food.name,
        amount,
        kcal_total: kc,
        p_total: p,
        c_total: c,
        f_total: f,
        meal_type: mealType,
        log_date: today
    });

    await DailyLog.findOneAndUpdate(
        { user_id: userId, log_date: today },
        { $inc: { calories_consumed: kc } },
        { upsert: true, new: true }
    );

    return JSON.parse(JSON.stringify(log));
}

export async function getMongoDailyConsumption(userId: string) {
    await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];
    const logs = await FoodLog.find({ user_id: userId, log_date: today });
    
    const totals = logs.reduce((acc, l) => {
        acc.kcal += l.kcal_total;
        acc.p += l.p_total;
        acc.c += l.c_total;
        acc.f += l.f_total;
        return acc;
    }, { kcal: 0, p: 0, c: 0, f: 0 });

    return totals;
}

export async function getMongoDetailedFoodLogs(userId: string) {
    await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];
    const logs = await FoodLog.find({ user_id: userId, log_date: today })
        .populate('food_library')
        .sort({ createdAt: -1 });
    
    // Map to ensure food_library.name is always available via food_name fallback
    const mapped = logs.map(log => {
        const obj = log.toObject();
        if (!obj.food_library || !obj.food_library.name) {
            obj.food_library = { name: obj.food_name || 'Alimento', unit: 'g' };
        }
        return obj;
    });
    return JSON.parse(JSON.stringify(mapped));
}

export async function deleteMongoFoodEntry(userId: string, logId: string) {
    await connectToDatabase();
    const log = await FoodLog.findOne({ _id: logId, user_id: userId });
    if (!log) return { error: 'Entrada no encontrada' };

    // Subtract from daily log
    const today = log.log_date;
    await DailyLog.findOneAndUpdate(
        { user_id: userId, log_date: today },
        { $inc: { calories_consumed: -log.kcal_total } }
    );

    await FoodLog.deleteOne({ _id: logId });
    return { success: true };
}

export async function getMongoWeeklyLogs(userId: string) {
    await connectToDatabase();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const logs = await DailyLog.find({
        user_id: userId,
        log_date: { $in: last7Days }
    });

    return last7Days.map(dateStr => {
        const found = logs.find(d => d.log_date === dateStr);
        return found ? JSON.parse(JSON.stringify(found)) : { log_date: dateStr, status: 'none' };
    });
}

export async function logMongoDailyStatus(userId: string) {
    await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];
    const log = await DailyLog.findOneAndUpdate(
        { user_id: userId, log_date: today },
        { status: 'perfect' },
        { upsert: true, new: true }
    );
    return JSON.parse(JSON.stringify(log));
}
