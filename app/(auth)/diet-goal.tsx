import { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Image,
    ActivityIndicator,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import { updateUser } from "../lib/user";

const goals = [
    {
        id: "lose_weight",
        title: "Lose Weight",
        description: "Create a calorie deficit to lose weight",
        icon: require("../../assets/Scale.png"),
    },
    {
        id: "gain_weight",
        title: "Gain Weight",
        description: "Eat more calories to gain healthy weight",
        icon: require("../../assets/Arm.png"),
    },
    {
        id: "maintain_weight",
        title: "Maintain Weight",
        description: "Keep your current weight and stay balanced",
        icon: require("../../assets/balanced-scale.png"),
    },
    {
        id: "build_muscle",
        title: "Build Muscle",
        description: "Support strength and muscle growth",
        icon: require("../../assets/dumbbell.png"),
    },
];

export default function DietGoalScreen() {
    const router = useRouter();
    const { userId } = useAuth();

    const [selectedGoal, setSelectedGoal] = useState("lose_weight");
    const [calories, setCalories] = useState(1800);
    const [saving, setSaving] = useState(false);

    const onCompleteSetup = async () => {
        if (!userId || saving) return;

        setSaving(true);
        try {
            await updateUser(userId, {
                dietGoal: selectedGoal,
                dailyCalorieTarget: calories,
            });
            router.replace("/(tabs)");
        } catch {
            router.replace("/(tabs)");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
        <Text style={styles.step}>Step 2 of 2</Text>

        <Text style={styles.title}>Choose your diet goal</Text>
        <Text style={styles.subtitle}>
            Select the goal that best matches your current lifestyle and what you want to achieve.
        </Text>

        <View style={styles.grid}>
            {goals.map((goal) => {
            const selected = selectedGoal === goal.id;

            return (
                <Pressable
                key={goal.id}
                onPress={() => setSelectedGoal(goal.id)}
                style={[styles.card, selected && styles.selectedCard]}
                >
                <Image source={goal.icon} style={styles.icon} resizeMode="contain" />

                <Text style={styles.cardTitle}>{goal.title}</Text>
                <Text style={styles.cardDescription}>{goal.description}</Text>
                </Pressable>
            );
            })}
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Daily Calorie Target</Text>

        <Text style={styles.calorieText}>
            {calories.toLocaleString()} <Text style={styles.calorieUnit}>kcal / day</Text>
        </Text>

        <Slider
            minimumValue={1200}
            maximumValue={2400}
            step={100}
            value={calories}
            onValueChange={setCalories}
            minimumTrackTintColor="#C85A3A"
            maximumTrackTintColor="#EFECEA"
            thumbTintColor="#C85A3A"
            style={styles.slider}
        />

        <View style={styles.scaleRow}>
            <Text style={styles.scaleText}>1,200</Text>
            <Text style={styles.scaleText}>1,600</Text>
            <Text style={styles.scaleText}>1,800</Text>
            <Text style={styles.scaleText}>2,000</Text>
            <Text style={styles.scaleText}>2,400</Text>
        </View>

        <Pressable
            style={[styles.button, saving && { opacity: 0.7 }]}
            onPress={onCompleteSetup}
            disabled={saving}
        >
            {saving ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.buttonText}>Complete Setup</Text>
            )}
        </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAF7F4",
        paddingHorizontal: 34,
        paddingTop: 105,
    },

    step: {
        alignSelf: "flex-end",
        backgroundColor: "#F7DCD3",
        color: "#C85A3A",
        fontWeight: "700",
        fontSize: 12,
        paddingHorizontal: 15,
        paddingVertical: 7,
        borderRadius: 18,
        marginBottom: 10,
    },

    title: {
        color: "#111",
        fontSize: 21,
        fontWeight: "800",
        textAlign: "center",
    },

    subtitle: {
        color: "#8D8D8D",
        fontSize: 11,
        textAlign: "center",
        marginTop: 8,
        marginBottom: 28,
        lineHeight: 15,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 20,
    },

    card: {
        width: "47%",
        height: 142,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E4E0DD",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 3,
        elevation: 3,
    },

    selectedCard: {
        backgroundColor: "#F8E4DC",
        borderColor: "#D7775D",
    },

    icon: {
        width: 58,
        height: 58,
        marginBottom: 12,
    },

    cardTitle: {
        color: "#111",
        fontSize: 13,
        fontWeight: "800",
        textAlign: "center",
    },

    cardDescription: {
        color: "#8A8A8A",
        fontSize: 8,
        textAlign: "center",
        marginTop: 6,
        lineHeight: 11,
    },

    divider: {
        height: 1,
        backgroundColor: "#EEE7E3",
        marginTop: 28,
        marginBottom: 18,
    },

    sectionTitle: {
        color: "#111",
        fontSize: 16,
        fontWeight: "800",
    },

    calorieText: {
        color: "#C85A3A",
        fontSize: 31,
        fontWeight: "800",
        marginTop: 16,
    },

    calorieUnit: {
        fontSize: 18,
    },

    slider: {
        width: "100%",
        height: 34,
        marginTop: 14,
    },

    scaleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 2,
    },

    scaleText: {
        color: "#9A9A9A",
        fontSize: 10,
    },

    button: {
        height: 42,
        backgroundColor: "#D7775D",
        borderRadius: 9,
        justifyContent: "center",
        marginTop: 34,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 3,
        elevation: 4,
    },

    buttonText: {
        color: "#FFFFFF",
        textAlign: "center",
        fontSize: 15,
        fontWeight: "600",
    },
});