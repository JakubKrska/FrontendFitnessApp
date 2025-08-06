import React, { useState } from 'react';
import { View, Alert, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTitle from '../components/ui/AppTitle';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';

const GOALS = [
    "Zhubnout",
    "Nabrat svaly",
    "Zlepšit kondici",
    "Zdravotní důvody",
    "Zvýšit sílu",
];

const OnboardingGoalScreen = ({ navigation }) => {
    const [selectedGoal, setSelectedGoal] = useState(null);

    const saveGoal = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            Alert.alert("Chyba", "Přihlášení selhalo");
            return;
        }

        try {
            if (selectedGoal) {
                // Uložíme cíl do backendu
                const response = await apiFetch("/users/me", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ goal: selectedGoal }),
                });

                console.log("Goal uložen:", response);


                navigation.navigate("RecommendedPlans", { goal: selectedGoal });
            } else {

                navigation.reset({
                    index: 0,
                    routes: [{ name: "MainTabs" }],
                });
            }
        } catch (err) {
            console.error("Chyba při ukládání goal:", err);
            Alert.alert("Chyba", "Nepodařilo se uložit cíl.");
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.inner}>
                <AppTitle style={styles.title}>Jaký je tvůj cíl?</AppTitle>

                <View style={styles.goals}>
                    {GOALS.map((goal) => (
                        <AppButton
                            key={goal}
                            title={goal}
                            onPress={() => setSelectedGoal(goal)}
                            style={[
                                styles.goalButton,
                                selectedGoal === goal && styles.goalButtonSelected
                            ]}
                            textStyle={{
                                color: selectedGoal === goal ? colors.white : colors.text,
                            }}
                        />
                    ))}
                </View>

                <View style={{ marginTop: spacing.large }}>
                    <AppButton
                        title={selectedGoal ? "Pokračovat" : "Přeskočit a pokračovat"}
                        onPress={saveGoal}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.large,
    },
    inner: {
        flex: 1,
        justifyContent: "center",
    },
    title: {
        marginBottom: spacing.large,
        textAlign: "center",
    },
    goals: {
        gap: spacing.small,
        marginBottom: spacing.large,
    },
    goalButton: {
        backgroundColor: colors.card,
        paddingVertical: spacing.medium,
    },
    goalButtonSelected: {
        backgroundColor: colors.primary,
    },
});

export default OnboardingGoalScreen;
