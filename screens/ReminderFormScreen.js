import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    Alert,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import AppTextInput from '../components/ui/AppTextInput';
import AppButton from '../components/ui/AppButton';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne'];
const DAY_MAP = { Po: 1, Ut: 2, St: 3, Ct: 4, Pa: 5, So: 6, Ne: 0 };


const ReminderFormScreen = ({ navigation }) => {
    const [time, setTime] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
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
            console.log("📥 ReminderFormScreen render");
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
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const ensureNotificationPermission = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            if (newStatus !== 'granted') {
                Alert.alert('Přístup odepřen', 'Povol notifikace v nastavení zařízení.');
                return false;
            }
        }
        return true;
    };

    const scheduleNotification = async (timeStr, days) => {
        const [hour, minute] = timeStr.split(':').map(Number);
        for (let day of days) {
            const weekday = DAY_MAP[day];
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Připomínka",
                    body: "Dnes máš trénink!",
                },
                trigger: {
                    weekday,
                    hour,
                    minute,
                    repeats: true,
                },
            });
        }
    };

    const submit = async () => {
        console.log("🚀 Submit stisknuto");
        if (!time.match(/^\d{2}:\d{2}$/)) {
            Alert.alert("Chyba", "Zadej čas ve formátu HH:mm (např. 07:30)");
            return;
        }
        if (selectedDays.length === 0) {
            Alert.alert("Chyba", "Vyber alespoň jeden den");
            return;
        }

        if (!await ensureNotificationPermission()) return;

        const token = await AsyncStorage.getItem('token');

        const workoutPlanId =
            selectedPlanId === 'null' || selectedPlanId === null
                ? null
                : selectedPlanId;

        console.log("📡 Odesílám připomínku:", {
            time,
            daysOfWeek: selectedDays,
            workoutPlanId,
        });

        try {
            await apiFetch('/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    time,
                    daysOfWeek: selectedDays,
                    workoutPlanId,
                }),
            });

            await scheduleNotification(time, selectedDays);
            Alert.alert('Připomínka přidána');
            navigation.goBack();
        } catch (err) {
            console.error("❌ Chyba při odesílání připomínky:", err);
            Alert.alert('Chyba při ukládání', err?.message ?? 'Neznámá chyba.');
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Zvol čas</Text>
            <AppButton title={time ? `⏰ ${time}` : 'Vybrat čas'} onPress={() => setShowPicker(true)} />

            {showPicker && (
                <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display="spinner"
                    is24Hour={true}
                    onChange={onTimeChange}
                />
            )}

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

            <Text style={styles.label}>Plán cvičení (volitelný)</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={selectedPlanId ?? "null"}
                    onValueChange={(val) => setSelectedPlanId(val)}
                >
                    <Picker.Item label="Žádný" value="null" />
                    {plans.map(plan => (
                        <Picker.Item key={plan.id} label={plan.name} value={plan.id} />
                    ))}
                </Picker>
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
    pickerWrapper: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 6,
        marginBottom: spacing.large,
    },
});

export default ReminderFormScreen;
