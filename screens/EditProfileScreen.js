import React, { useState, useEffect } from "react";
import { ScrollView, Alert, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

import AppTitle from "../components/ui/AppTitle";
import AppTextInput from "../components/ui/AppTextInput";
import AppButton from "../components/ui/AppButton";
import { colors, spacing } from "../components/ui/theme";
import { apiFetch } from "../api";

const EditProfileScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        name: "",
        plainPassword: "",
        confirmPassword: "",
        age: "",
        height: "",
        weight: "",
        gender: "",
        goal: "",
        experienceLevel: "",
    });
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                const data = await apiFetch("/users/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUserId(data.id);
                setFormData({
                    name: data.name || "",
                    plainPassword: "",
                    confirmPassword: "",
                    age: data.age?.toString() || "",
                    height: data.height?.toString() || "",
                    weight: data.weight?.toString() || "",
                    gender: data.gender || "",
                    goal: data.goal || "",
                    experienceLevel: data.experienceLevel || "",
                });
            } catch (err) {
                Alert.alert("Chyba", "Nepodařilo se načíst uživatele.");
                navigation.goBack();
            }
        };
        fetchUser();
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        const { name, age, height, weight, plainPassword, confirmPassword } = formData;
        if (!name || !age || !height || !weight) {
            Alert.alert("Chyba", "Vyplň prosím všechna povinná pole.");
            return false;
        }
        if (plainPassword && plainPassword !== confirmPassword) {
            Alert.alert("Chyba", "Zadaná hesla se neshodují.");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const token = await AsyncStorage.getItem("token");

            const payload = {
                ...formData,
                ...(formData.plainPassword === "" && { plainPassword: undefined }),
                confirmPassword: undefined,
            };

            await apiFetch(`/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            Alert.alert("Úspěch", "Profil byl upraven.");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Chyba", "Nepodařilo se upravit profil.");
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <AppTitle>Úprava profilu</AppTitle>

            <AppTextInput placeholder="Jméno" value={formData.name} onChangeText={(val) => handleChange("name", val)} />
            <AppTextInput placeholder="Nové heslo (volitelné)" secureTextEntry value={formData.plainPassword} onChangeText={(val) => handleChange("plainPassword", val)} />
            <AppTextInput placeholder="Potvrzení hesla" secureTextEntry value={formData.confirmPassword} onChangeText={(val) => handleChange("confirmPassword", val)} />

            <TextLabel label="Věk" />
            <Picker selectedValue={formData.age} onValueChange={(val) => handleChange("age", val)} style={styles.picker}>
                <Picker.Item label="Vyber věk..." value="" />
                {Array.from({ length: 91 }, (_, i) => i + 10).map((val) => (
                    <Picker.Item key={val} label={`${val} let`} value={val.toString()} />
                ))}
            </Picker>

            <TextLabel label="Výška (cm)" />
            <Picker selectedValue={formData.height} onValueChange={(val) => handleChange("height", val)} style={styles.picker}>
                <Picker.Item label="Vyber výšku..." value="" />
                {Array.from({ length: 151 }, (_, i) => i + 100).map((val) => (
                    <Picker.Item key={val} label={`${val} cm`} value={val.toString()} />
                ))}
            </Picker>

            <TextLabel label="Váha (kg)" />
            <Picker selectedValue={formData.weight} onValueChange={(val) => handleChange("weight", val)} style={styles.picker}>
                <Picker.Item label="Vyber váhu..." value="" />
                {Array.from({ length: 221 }, (_, i) => i + 30).map((val) => (
                    <Picker.Item key={val} label={`${val} kg`} value={val.toString()} />
                ))}
            </Picker>

            <TextLabel label="Pohlaví" />
            <Picker selectedValue={formData.gender} onValueChange={(val) => handleChange("gender", val)} style={styles.picker}>
                <Picker.Item label="Vyber..." value="" />
                <Picker.Item label="Muž" value="male" />
                <Picker.Item label="Žena" value="female" />
                <Picker.Item label="Jiné" value="other" />
            </Picker>

            <TextLabel label="Cíl" />
            <Picker selectedValue={formData.goal} onValueChange={(val) => handleChange("goal", val)} style={styles.picker}>
                <Picker.Item label="Vyber..." value="" />
                <Picker.Item label="Hubnutí" value="Hubnutí" />
                <Picker.Item label="Zůstat fit" value="Zůstat fit" />
                <Picker.Item label="Nabrat svaly" value="Nabrat svaly" />
            </Picker>

            <TextLabel label="Zkušenosti" />
            <Picker selectedValue={formData.experienceLevel} onValueChange={(val) => handleChange("experienceLevel", val)} style={styles.picker}>
                <Picker.Item label="Vyber..." value="" />
                <Picker.Item label="Začátečník" value="Začátečník" />
                <Picker.Item label="Pokročilý" value="Pokročilý" />
                <Picker.Item label="Expert" value="Expert" />
            </Picker>

            <AppButton title="Uložit změny" onPress={handleSubmit} />
        </ScrollView>
    );
};

const TextLabel = ({ label }) => (
    <View style={{ marginTop: spacing.medium, marginBottom: spacing.small }}>
        <AppTitle style={{ fontSize: 16 }}>{label}</AppTitle>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        padding: spacing.large,
        flexGrow: 1,
    },
    picker: {
        backgroundColor: colors.white,
        borderColor: colors.gray,
        borderWidth: 1,
        borderRadius: 6,
        marginBottom: spacing.medium,
    },
});

export default EditProfileScreen;
