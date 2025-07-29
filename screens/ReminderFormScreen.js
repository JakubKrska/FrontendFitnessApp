import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';

const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

const ReminderFormScreen = ({ navigation }) => {
    const [time, setTime] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);

    const toggleDay = (day) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const submit = async () => {
        if (!time.match(/^\d{2}:\d{2}$/)) {
            Alert.alert("Chyba", "Zadej čas ve formátu HH:mm (např. 07:30)");
            return;
        }
        if (selectedDays.length === 0) {
            Alert.alert("Chyba", "Vyber alespoň jeden den");
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');

            await apiFetch('/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    time,
                    daysOfWeek: selectedDays,
                    workoutPlanId: null,
                }),
            });

            Alert.alert('Připomínka přidána');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Chyba při ukládání', typeof err === 'string' ? err : 'Neznámá chyba.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Zadej čas (např. 07:00)</Text>
            <AppTextInput
                value={time}
                onChangeText={setTime}
                placeholder="HH:mm"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Dny v týdnu</Text>
            <View style={styles.dayGrid}>
                {DAYS.map(day => (
                    <AppButton
                        key={day}
                        title={day}
                        onPress={() => toggleDay(day)}
                        color={selectedDays.includes(day) ? colors.primary : colors.gray}
                        style={styles.dayButton}
                    />
                ))}
            </View>

            <AppButton title="Uložit připomínku" onPress={submit} />
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
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: spacing.small,
        color: colors.text,
    },
    dayGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.large,
        gap: 8,
    },
    dayButton: {
        marginRight: spacing.small / 2,
        marginBottom: spacing.small,
        minWidth: 50,
        justifyContent: 'center',
    },
});

export default ReminderFormScreen;
