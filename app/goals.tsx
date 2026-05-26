import {
    useEffect,
    useState,
} from "react";

import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GoalsScreen() {
  const [goals, setGoals] = useState<
    any[]
  >([]);

  const [money, setMoney] =
    useState(0);

  const [showCreator, setShowCreator] =
    useState(false);

  const [goalName, setGoalName] =
    useState("");

  const [goalEmoji, setGoalEmoji] =
    useState("");

  const [goalAmount, setGoalAmount] =
    useState("");

  useEffect(() => {
    loadGoals();

    const interval = setInterval(() => {
      loadGoals();
    }, 100);

    return () =>
      clearInterval(interval);
  }, []);

  const loadGoals = async () => {
    const savedGoals =
      await AsyncStorage.getItem(
        "moneyflow_goals"
      );

    const savedData =
      await AsyncStorage.getItem(
        "moneyflow_data"
      );

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    if (savedData) {
      const data =
        JSON.parse(savedData);

      setMoney(data.money || 0);
    }
  };

  const saveGoals = async (
    updatedGoals: any[]
  ) => {
    setGoals(updatedGoals);

    await AsyncStorage.setItem(
      "moneyflow_goals",
      JSON.stringify(updatedGoals)
    );
  };

  const addGoal = async () => {
    if (
      !goalName ||
      !goalAmount
    )
      return;

    const newGoal = {
      id: Date.now(),
      name: goalName,
      emoji:
        goalEmoji || "💸",
      target:
        parseFloat(goalAmount),
    };

    const updatedGoals = [
      ...goals,
      newGoal,
    ];

    saveGoals(updatedGoals);

    setGoalName("");
    setGoalEmoji("");
    setGoalAmount("");

    setShowCreator(false);
  };

  const deleteGoal = async (
    id: number
  ) => {
    const updatedGoals =
      goals.filter(
        (goal) =>
          goal.id !== id
      );

    saveGoals(updatedGoals);
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#000",
      }}
      contentContainerStyle={{
        padding: 24,
        paddingTop: 120,
        paddingBottom: 60,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 60,
          left: 20,
          zIndex: 10,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 18,
          }}
        >
          ← Retour
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 42,
            fontWeight: "bold",
          }}
        >
          Objectifs
        </Text>

        <TouchableOpacity
          onPress={() =>
            setShowCreator(
              !showCreator
            )
          }
          style={{
            backgroundColor:
              "#00ff99",
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              color: "black",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      {showCreator && (
        <View
          style={{
            backgroundColor:
              "#111",
            padding: 20,
            borderRadius: 24,
            marginBottom: 24,
          }}
        >
          <TextInput
            placeholder="Nom"
            placeholderTextColor="#666"
            value={goalName}
            onChangeText={
              setGoalName
            }
            style={{
              backgroundColor:
                "#1a1a1a",
              color: "white",
              padding: 16,
              borderRadius: 16,
              marginBottom: 14,
            }}
          />

          <TextInput
            placeholder="Emoji"
            placeholderTextColor="#666"
            value={goalEmoji}
            onChangeText={
              setGoalEmoji
            }
            style={{
              backgroundColor:
                "#1a1a1a",
              color: "white",
              padding: 16,
              borderRadius: 16,
              marginBottom: 14,
            }}
          />

          <TextInput
            placeholder="Montant (€)"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={goalAmount}
            onChangeText={
              setGoalAmount
            }
            style={{
              backgroundColor:
                "#1a1a1a",
              color: "white",
              padding: 16,
              borderRadius: 16,
              marginBottom: 18,
            }}
          />

          <TouchableOpacity
            onPress={addGoal}
            style={{
              backgroundColor:
                "#00ff99",
              padding: 18,
              borderRadius: 18,
              alignItems:
                "center",
            }}
          >
            <Text
              style={{
                color: "black",
                fontWeight:
                  "bold",
              }}
            >
              Ajouter
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {goals.map((goal) => {
        const progress =
          (money / goal.target) *
          100;

        const completed =
          money >= goal.target;

        return (
          <View
            key={goal.id}
            style={{
              backgroundColor:
                "#111",
              padding: 24,
              borderRadius: 24,
              marginBottom: 18,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 26,
                  fontWeight:
                    "bold",
                }}
              >
                {goal.emoji}{" "}
                {goal.name}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  deleteGoal(
                    goal.id
                  )
                }
              >
                <Text
                  style={{
                    color:
                      "#ff4d4d",
                    fontWeight:
                      "bold",
                  }}
                >
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                height: 16,
                backgroundColor:
                  "#222",
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: `${Math.min(
                    progress,
                    100
                  )}%`,
                  backgroundColor:
                    "#00ff99",
                  height: "100%",
                  borderRadius: 999,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent:
                  "space-between",
              }}
            >
              <Text
                style={{
                  color: "#888",
                  fontSize: 16,
                }}
              >
                {money.toFixed(
                  2
                )} €
              </Text>

              <Text
                style={{
                  color: "#888",
                  fontSize: 16,
                }}
              >
                {goal.target} €
              </Text>
            </View>

            <Text
              style={{
                color:
                  completed
                    ? "#00ff99"
                    : "#00ff99",
                marginTop: 14,
                fontWeight: "600",
                fontSize: 15,
              }}
            >
              {completed
                ? "✅ Objectif atteint"
                : `${progress.toFixed(
                    0
                  )}% complété`}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}