import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { apiFetch } from "./api";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from 'react-native-gesture-handler';


// Auth and onboarding
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import OnboardingGoalScreen from "./screens/OnboardingGoalScreen";
import RecommendedPlansScreen from "./screens/RecommendedPlansScreen";

// Hlavní navigace
import BottomTabNavigator from "./navigation/BottomTabNavigator";

// Akční screeny
import EditProfileScreen from "./screens/EditProfileScreen";
import WorkoutSessionScreen from "./screens/WorkoutSessionScreen";
import WorkoutHistoryDetailScreen from "./screens/WorkoutHistoryDetailScreen";
import PerformanceChartScreen from "./screens/PerformanceChartScreen";
import WorkoutSummaryScreen from "./screens/WorkoutSummaryScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import BadgesScreen from "./screens/BadgesScreen";
import WorkoutPlanDetailsScreen from "./screens/WorkoutPlanDetailsScreen";
import ReminderFormScreen from "./screens/ReminderFormScreen";
import ExerciseDetailsScreen from "./screens/ExerciseDetailsScreen";
import ReminderListScreen from "./screens/ReminderListScreen";
import WeightScreen from "./screens/WeightScreen";
import SelectPlanForExerciseScreen from "./screens/SelectPlanForExerciseScreen";
import EditReminderScreen from "./screens/EditReminderScreen";


const Stack = createNativeStackNavigator();

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const checkStartupState = async () => {
            try {
                const token = await AsyncStorage.getItem("token");


                setInitialRoute("Welcome");
            } catch (e) {
                console.error("Chyba při načítání tokenu", e);
                setInitialRoute("Welcome"); // fallback
            }
        };

        checkStartupState();
    }, []);

    useEffect(() => {
        const setupNotifications = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }

            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                }),
            });
        };

        setupNotifications();
    }, []);

    if (!initialRoute) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
                    <Stack.Screen name="RecommendedPlans" component={RecommendedPlansScreen} />
                    <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                    <Stack.Screen name="WeightScreen" component={WeightScreen} />
                    <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
                    <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
                    <Stack.Screen name="WorkoutHistoryDetail" component={WorkoutHistoryDetailScreen} />
                    <Stack.Screen name="PerformanceChart" component={PerformanceChartScreen} />
                    <Stack.Screen name="Badges" component={BadgesScreen} />
                    <Stack.Screen name="WorkoutPlansDetail" component={WorkoutPlanDetailsScreen} />
                    <Stack.Screen name="Reminders" component={ReminderListScreen} />
                    <Stack.Screen name="AddReminder" component={ReminderFormScreen} />
                    <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
                    <Stack.Screen name="WorkoutPlanDetails" component={WorkoutPlanDetailsScreen} />
                    <Stack.Screen name="SelectPlanForExercise" component={SelectPlanForExerciseScreen} />
                    <Stack.Screen name="EditReminder" component={EditReminderScreen} />
                </Stack.Navigator>
            </NavigationContainer>
            <Toast />
        </GestureHandlerRootView>
    );
}
