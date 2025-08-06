import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AppButton from "../components/ui/AppButton";
import { colors, spacing } from "../components/ui/theme";

const WelcomeScreen = ({ navigation }) => {
    const handleNavigate = (screen) => {
        navigation.navigate(screen);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Vítej ve FitnessApp</Text>
                <Text style={styles.subtitle}>
                    Sleduj pokroky, plánuj tréninky, motivuj se.
                </Text>

                <View style={styles.buttonGroup}>
                    <AppButton
                        title="Přihlásit se"
                        onPress={() => handleNavigate("Login")}
                    />
                    <AppButton
                        title="Registrace"
                        onPress={() => handleNavigate("Register")}
                        color={colors.secondary}
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
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.large,
    },
    content: {
        width: "100%",
        maxWidth: 400,
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.primary,
        marginBottom: spacing.medium,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: colors.text,
        marginBottom: spacing.xlarge,
        textAlign: "center",
    },
    buttonGroup: {
        width: "100%",
    },
});

export default WelcomeScreen;
