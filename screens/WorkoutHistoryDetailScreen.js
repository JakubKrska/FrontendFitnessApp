import React, { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Text,
    Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppTitle from "../components/ui/AppTitle";
import AppCard from "../components/ui/AppCard";
import AppButton from "../components/ui/AppButton";
import { colors, spacing } from "../components/ui/theme";
import { apiFetch } from "../api";

const WorkoutHistoryDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { historyId, completedAt, planName, planId } = route.params;

    const [loading, setLoading] = useState(true);
    const [exerciseItems, setExerciseItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                // 1. Získáme cviky z plánu
                const workoutExercises = await apiFetch(`/workout-exercises/${planId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // 2. Ke každému cviku stáhneme jeho název
                const detailed = await Promise.all(
                    workoutExercises.map(async (we) => {
                        const exercise = await apiFetch(`/exercises/${we.exerciseId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        return {
                            name: exercise.name,
                            sets: we.sets,
                            reps: we.reps,
                        };
                    })
                );

                setExerciseItems(detailed);
            } catch (e) {
                console.error("❌ Chyba při načítání historie:", e);
                Alert.alert("Chyba", "Nepodařilo se načíst detaily tréninku.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [planId]);

    const handleRepeat = () => {
        if (!planId) {
            Alert.alert("Nelze spustit", "Tento trénink nemá přiřazený plán.");
            return;
        }
        navigation.navigate("WorkoutSession", { planId });
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Detail tréninku</AppTitle>

            <AppCard>
                <Text style={styles.label}>Datum dokončení</Text>
                <Text style={styles.text}>{new Date(completedAt).toLocaleString("cs-CZ")}</Text>
                <Text style={[styles.label, { marginTop: spacing.medium }]}>Název plánu</Text>
                <Text style={styles.text}>{planName || "Neznámý plán"}</Text>
            </AppCard>

            <AppTitle style={{ marginTop: spacing.large }}>Cviky</AppTitle>

            {exerciseItems.length === 0 ? (
                <Text style={styles.empty}>Žádné cviky v plánu</Text>
            ) : (
                exerciseItems.map((item, index) => (
                    <AppCard key={index}>
                        <Text style={styles.exerciseName}>{item.name}</Text>
                        <Text>{item.sets} sérií • {item.reps} opakování</Text>
                    </AppCard>
                ))
            )}

            <AppButton
                title="Opakovat trénink"
                onPress={handleRepeat}
                style={{ marginTop: spacing.large }}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
        flexGrow: 1,
    },
    label: {
        fontWeight: "bold",
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    text: {
        fontSize: 16,
        color: colors.text,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
        color: colors.text,
    },
    empty: {
        textAlign: "center",
        color: colors.gray,
        marginTop: spacing.large,
        fontSize: 16,
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
});

export default WorkoutHistoryDetailScreen;
