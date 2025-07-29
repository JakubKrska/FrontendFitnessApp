import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppTitle from '../components/ui/AppTitle';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';
import DayPicker from '../components/utils/DayPicker';

export default function EditReminderScreen({ route, navigation }) {
    const { reminder } = route.params;
    const [time, setTime] = useState(reminder.time);
    const [days, setDays] = useState(reminder.daysOfWeek || []);

    const handleUpdate = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            await apiFetch(`/reminders/${reminder.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    time,
                    daysOfWeek: days,
                    workoutPlanId: reminder.workoutPlanId,
                }),
            });

            Alert.alert("Úspěch", "Připomínka aktualizována");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Chyba", "Nepodařilo se upravit připomínku.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Úprava připomínky</AppTitle>

            <Text style={styles.label}>Čas (např. 07:00)</Text>
            <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
            />

            <Text style={styles.label}>Dny v týdnu</Text>
            <DayPicker selectedDays={days} onChange={setDays} />

            <AppButton title="Uložit změny" onPress={handleUpdate} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: spacing.small,
        color: colors.text,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray,
        padding: spacing.small,
        borderRadius: 6,
        backgroundColor: colors.white,
    },
});
