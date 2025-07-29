import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

import AppTitle from '../components/ui/AppTitle';
import AppButton from '../components/ui/AppButton';
import AppCard from '../components/ui/AppCard';
import { apiFetch } from '../api';
import { colors, spacing } from '../components/ui/theme';

export default function ReminderListScreen({ navigation }) {
    const [reminders, setReminders] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) fetchReminders();
    }, [isFocused]);

    const fetchReminders = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const data = await apiFetch('/reminders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReminders(data);
        } catch (err) {
            Alert.alert("Chyba", "Nepodařilo se načíst připomínky.");
        }
    };

    const deleteReminder = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token');
            await apiFetch(`/reminders/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchReminders();
        } catch (err) {
            Alert.alert("Chyba", "Nepodařilo se smazat připomínku.");
        }
    };

    const renderItem = ({ item }) => (
        <AppCard style={styles.card}>
            <Text style={styles.label}>⏰ Čas: <Text style={styles.value}>{item.time}</Text></Text>
            <Text style={styles.label}>📅 Dny: <Text style={styles.value}>{item.daysOfWeek.join(', ')}</Text></Text>

            <AppButton
                title="Upravit"
                onPress={() => navigation.navigate("EditReminder", { reminder: item })}
                style={styles.button}
            />
            <AppButton
                title="Smazat"
                color={colors.danger}
                onPress={() => deleteReminder(item.id)}
                style={styles.button}
            />
        </AppCard>
    );

    return (
        <View style={styles.container}>
            <AppTitle>Připomínky</AppTitle>

            <AppButton
                title="➕ Přidat připomínku"
                onPress={() => navigation.navigate('AddReminder')}
                style={{ marginBottom: spacing.medium }}
            />

            <FlatList
                data={reminders}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    card: {
        marginBottom: spacing.medium,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    value: {
        fontWeight: 'normal',
    },
    button: {
        marginTop: spacing.small,
    },
});
