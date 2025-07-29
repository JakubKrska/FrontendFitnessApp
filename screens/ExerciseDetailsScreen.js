import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    Image,
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
    Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppTitle from '../components/ui/AppTitle';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import AppTextInput from '../components/ui/AppTextInput';
import { colors, spacing } from '../components/ui/theme';
import { apiFetch } from '../api';
import { useNavigation } from '@react-navigation/native';

const ExerciseDetailsScreen = () => {
    const route = useRoute();
    const { id } = route.params;

    const [exercise, setExercise] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        fetchExercise();
        fetchComments();
    }, [id]);

    const fetchExercise = async () => {
        try {
            const data = await apiFetch(`/exercises/${id}`);
            setExercise(data);
        } catch (err) {
            console.error('❌ Chyba při načítání cviku:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const res = await apiFetch(`/comments/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (Array.isArray(res)) {
                setComments(res);
            } else {
                console.warn("⚠️ Neplatný formát komentářů:", res);
            }
        } catch (err) {
            console.error("❌ Chyba při načítání komentářů:", err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const token = await AsyncStorage.getItem("token");
            await apiFetch("/comments", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    exerciseId: id,
                    commentText: newComment.trim(),
                }),
            });

            setNewComment('');
            fetchComments();
        } catch (err) {
            console.error("❌ Chyba při přidání komentáře:", err);
            Alert.alert("Chyba", "Nepodařilo se přidat komentář.");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!exercise) {
        return (
            <View style={styles.center}>
                <Text style={{ color: colors.text }}>Cvik nenalezen.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>{exercise.name}</AppTitle>

            <AppCard>
                <Label title="Svalová skupina" value={exercise.muscleGroup} />
                <Label title="Obtížnost" value={exercise.difficulty} />
                {exercise.description && (
                    <Label title="Popis" value={exercise.description} multiline />
                )}
                {exercise.imageUrl ? (
                    <Image source={{ uri: exercise.imageUrl }} style={styles.image} />
                ) : (
                    <View style={[styles.image, {
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.card
                    }]}>
                        <Text style={{ color: colors.gray }}>Bez obrázku</Text>
                    </View>
                )}
            </AppCard>

            <AppButton
                title="Přidat do tréninkového plánu"
                onPress={() => navigation.navigate('SelectPlanForExercise', { exerciseId: exercise.id })}
            />

            <AppTitle style={{ marginTop: spacing.large }}>Komentáře</AppTitle>
            {comments.length === 0 ? (
                <Text style={styles.italic}>Zatím žádné komentáře.</Text>
            ) : (
                comments.map((c) => (
                    <View key={c.id} style={styles.commentCard}>
                        <Text style={styles.commentText}>{c.commentText}</Text>
                    </View>
                ))
            )}

            <AppTextInput
                placeholder="Přidej komentář..."
                value={newComment}
                onChangeText={setNewComment}
            />
            <AppButton title="Odeslat komentář" onPress={handleAddComment} />
        </ScrollView>
    );
};

const Label = ({ title, value, multiline }) => (
    <View style={{ marginBottom: spacing.small }}>
        <Text style={styles.label}>
            <Text style={styles.bold}>{title}: </Text>
            <Text style={{ lineHeight: multiline ? 20 : 16 }}>{value}</Text>
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.large,
        backgroundColor: colors.background,
    },
    label: {
        fontSize: 16,
        color: colors.text,
    },
    bold: {
        fontWeight: 'bold',
    },
    italic: {
        fontStyle: 'italic',
        color: colors.gray,
    },
    image: {
        width: '100%',
        height: 240,
        resizeMode: 'cover',
        marginTop: spacing.medium,
        borderRadius: 8,
    },
    commentCard: {
        backgroundColor: colors.card,
        padding: spacing.medium,
        borderRadius: 10,
        marginBottom: spacing.small,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    commentText: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 20,
    },
});

export default ExerciseDetailsScreen;
