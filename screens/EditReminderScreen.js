import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    Alert,
    View,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../api';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

const EditReminderScreen = ({ route, navigation }) => {
    const reminder = route.params?.reminder;

    const [time, setTime] = useState(reminder?.time || '');
    const [selectedDays, setSelectedDays] = useState(reminder?.daysOfWeek || []);
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(reminder?.workoutPlanId ?? 'null');
    const [loading, setLoading] = useState(true);
    const [showPicker, setShowPicker] = useState(false);

    const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const onTimeChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            const formatted = formatTime(selectedDate);
            setTime(formatted);
        }
    };

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const userId = await AsyncStorage.getItem('userId');
                const allPlans = await apiFetch("/workout-plans", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const myPlans = allPlans.filter(p => p.userId === userId);
                setPlans(myPlans);
            } catch (e) {
                Alert.alert("Chyba", "Nepodařilo se načíst plány.");
            } finally {
                setLoading(false);
            }
        };
        loadPlans();
    }, []);

    const toggleDay = (day) => {
        setSelectedDays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day]
        );
    };

    const submit = async () => {
        if (!time.match(/^\d{2}:\d{2}$/)) {
            Alert.alert('Chyba', 'Zadej čas ve formátu HH:mm (např. 07:30)');
            return;
        }

        if (selectedDays.length === 0) {
            Alert.alert('Chyba', 'Vyber alespoň jeden den');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token');

            await apiFetch(`/reminders/${reminder.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    time,
                    daysOfWeek: selectedDays,
                    workoutPlanId: selectedPlanId === 'null' ? null : selectedPlanId,
                }),
            });

            Alert.alert('Připomínka upravena');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Chyba', 'Nepodařilo se upravit připomínku.');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Zvol čas</Text>
            <AppButton
                title={time ? `⏰ ${time}` : 'Vybrat čas'}
                onPress={() => setShowPicker(true)}
            />
            {showPicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="spinner"
                    is24Hour={true}
                    onChange={onTimeChange}
                />
            )}

            <Text style={styles.label}>Změň dny</Text>
            <View style={styles.dayGrid}>
                {DAYS.map((day) => (
                    <AppButton
                        key={day}
                        title={day}
                        onPress={() => toggleDay(day)}
                        color={selectedDays.includes(day) ? colors.primary : colors.gray}
                        style={styles.dayButton}
                    />
                ))}
            </View>

            <Text style={styles.label}>Plán cvičení (volitelný)</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={selectedPlanId}
                    onValueChange={(val) => setSelectedPlanId(val)}
                >
                    <Picker.Item label="Žádný" value="null" />
                    {plans.map(plan => (
                        <Picker.Item key={plan.id} label={plan.name} value={plan.id} />
                    ))}
                </Picker>
            </View>

            <AppButton title="Uložit změny" onPress={submit} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
        flexGrow: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    pickerWrapper: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 6,
        marginBottom: spacing.large,
    },
});

export default EditReminderScreen;
