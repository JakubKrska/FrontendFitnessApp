import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from './ui/theme';

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DayPicker({ selectedDays, onChange }) {
    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            onChange(selectedDays.filter(d => d !== day));
        } else {
            onChange([...selectedDays, day]);
        }
    };

    return (
        <View style={styles.container}>
            {days.map((day) => (
                <TouchableOpacity
                    key={day}
                    onPress={() => toggleDay(day)}
                    style={[
                        styles.dayButton,
                        selectedDays.includes(day) && styles.daySelected
                    ]}
                >
                    <Text style={styles.dayText}>{day}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.large,
    },
    dayButton: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        margin: 4,
        backgroundColor: 'white',
    },
    daySelected: {
        backgroundColor: colors.primary,
    },
    dayText: {
        color: colors.text,
    },
});
