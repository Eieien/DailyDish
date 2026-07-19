import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, Image, StyleSheet, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";

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

export function goalLabel(goalId: string | null): string {
  return goals.find((g) => g.id === goalId)?.title ?? "Not set";
}

type Props = {
  visible: boolean;
  initialGoalId: string | null;
  initialCalories: number | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (goalId: string, calories: number) => void;
};

export function GoalPickerModal({
  visible,
  initialGoalId,
  initialCalories,
  saving,
  onClose,
  onSave,
}: Props) {
  const [selectedGoal, setSelectedGoal] = useState(initialGoalId ?? "lose_weight");
  const [calories, setCalories] = useState(initialCalories ?? 1800);

  useEffect(() => {
    if (visible) {
      setSelectedGoal(initialGoalId ?? "lose_weight");
      setCalories(initialCalories ?? 1800);
    }
  }, [visible, initialGoalId, initialCalories]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Set your daily goal</Text>
          <Text style={styles.subtitle}>
            Choose the goal that best matches what you want to achieve.
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

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              onPress={() => onSave(selectedGoal, calories)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Goal</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  title: {
    color: "#111",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#8D8D8D",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  card: {
    width: "47%",
    height: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E4E0DD",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  selectedCard: {
    backgroundColor: "#F8E4DC",
    borderColor: "#D7775D",
  },
  icon: {
    width: 42,
    height: 42,
    marginBottom: 8,
  },
  cardTitle: {
    color: "#111",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  cardDescription: {
    color: "#8A8A8A",
    fontSize: 8,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 11,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE7E3",
    marginTop: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#111",
    fontSize: 14,
    fontWeight: "800",
  },
  calorieText: {
    color: "#C85A3A",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 10,
  },
  calorieUnit: {
    fontSize: 15,
  },
  slider: {
    width: "100%",
    height: 34,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#E2DDD9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#9C9088",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#C85A3A",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
