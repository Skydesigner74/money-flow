import {
    useCallback,
    useState,
} from "react";

import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    router,
    useFocusEffect,
} from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { LineChart } from "react-native-chart-kit";

export default function StatsScreen() {
  const [money, setMoney] = useState(0);

  const [salaryMode, setSalaryMode] =
    useState("");

  const [salary, setSalary] =
    useState("");

  const [hourlySalary, setHourlySalary] =
    useState("");

  const [hoursPerWeek, setHoursPerWeek] =
    useState("");

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const savedData =
          await AsyncStorage.getItem(
            "moneyflow_data"
          );

        if (!savedData) return;

        const data = JSON.parse(savedData);

        setMoney(data.money || 0);

        setSalaryMode(
          data.salaryMode || ""
        );

        setSalary(data.salary || "");

        setHourlySalary(
          data.hourlySalary || ""
        );

        setHoursPerWeek(
          data.hoursPerWeek || ""
        );
      }

      loadData();
    }, [])
  );

  const hourlyRate =
    salaryMode === "hourly"
      ? parseFloat(hourlySalary || "0")
      : (() => {
          const monthly =
            parseFloat(salary || "0");

          const weeklyHours =
            parseFloat(
              hoursPerWeek || "0"
            );

          if (!monthly || !weeklyHours)
            return 0;

          return (
            (monthly * 12) /
            (weeklyHours * 52)
          );
        })();

  const screenWidth =
    Dimensions.get("window").width;

  const fakeData = [
    money * 0.2,
    money * 0.35,
    money * 0.45,
    money * 0.6,
    money * 0.75,
    money * 0.9,
    money,
  ];

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

      <Text
        style={{
          color: "white",
          fontSize: 42,
          fontWeight: "bold",
          marginBottom: 40,
        }}
      >
        Statistiques
      </Text>

      <View
        style={{
          backgroundColor: "#111",
          padding: 24,
          borderRadius: 24,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: "#666",
            fontSize: 16,
          }}
        >
          Depuis le début
        </Text>

        <Text
          style={{
            color: "#00ff99",
            fontSize: 32,
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          {money.toFixed(2)} €
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#111",
          padding: 24,
          borderRadius: 24,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: "#666",
            fontSize: 16,
          }}
        >
          Salaire horaire
        </Text>

        <Text
          style={{
            color: "#00ff99",
            fontSize: 32,
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          {hourlyRate.toFixed(2)} €/h
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#111",
          padding: 24,
          borderRadius: 24,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: "#666",
            fontSize: 16,
          }}
        >
          Gains par seconde
        </Text>

        <Text
          style={{
            color: "#00ff99",
            fontSize: 32,
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          {(hourlyRate / 3600).toFixed(
            4
          )}{" "}
          €/sec
        </Text>
      </View>

      <View
        style={{
          marginTop: 24,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Progression
        </Text>

        <LineChart
          data={{
            labels: [
              "L",
              "M",
              "M",
              "J",
              "V",
              "S",
              "D",
            ],
            datasets: [
              {
                data: fakeData,
              },
            ],
          }}
          width={screenWidth - 48}
          height={220}
          yAxisSuffix="€"
          chartConfig={{
            backgroundColor: "#111",
            backgroundGradientFrom:
              "#111",
            backgroundGradientTo:
              "#111",

            decimalPlaces: 0,

            color: (opacity = 1) =>
              `rgba(0, 255, 153, ${opacity})`,

            labelColor: (
              opacity = 1
            ) =>
              `rgba(255,255,255,${opacity})`,

            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#00ff99",
            },

            propsForBackgroundLines: {
              stroke: "#222",
            },
          }}
          bezier
          style={{
            borderRadius: 24,
          }}
        />
      </View>
    </ScrollView>
  );
}