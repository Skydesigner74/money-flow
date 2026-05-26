import { useEffect, useRef, useState } from "react";

import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Audio } from "expo-av";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

export default function HomeScreen() {
  const [salaryMode, setSalaryMode] = useState<
    "monthly" | "hourly"
  >("monthly");

  const [salary, setSalary] = useState("");

  const [hourlySalary, setHourlySalary] =
    useState("");

  const [hoursPerWeek, setHoursPerWeek] =
    useState("");

  const [daysPerWeek, setDaysPerWeek] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [money, setMoney] = useState(0);

  const [started, setStarted] =
    useState(false);

  const [paused, setPaused] = useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState("");

  const [perSecondDisplay, setPerSecondDisplay] =
    useState(0);

  const [lastTimestamp, setLastTimestamp] =
    useState(Date.now());

  const soundRef =
    useRef<Audio.Sound | null>(null);

  const lastEuro = useRef(0);

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const [showEuroPopup, setShowEuroPopup] =
    useState(false);

  const getPerSecond = () => {
    if (salaryMode === "hourly") {
      const hourly =
        parseFloat(hourlySalary);

      if (!hourly) return 0;

      return hourly / 3600;
    }

    const monthlySalary =
      parseFloat(salary);

    const weeklyHours =
      parseFloat(hoursPerWeek);

    if (
      !monthlySalary ||
      !weeklyHours
    )
      return 0;

    const yearlySalary =
      monthlySalary * 12;

    const yearlyHours =
      weeklyHours * 52;

    const hourlyRate =
      yearlySalary / yearlyHours;

    return hourlyRate / 3600;
  };

  const triggerEuroAnimation = () => {
    setShowEuroPopup(true);

    fadeAnim.setValue(0);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowEuroPopup(false);
    });
  };

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      const hours = now
        .getHours()
        .toString()
        .padStart(2, "0");

      const minutes = now
        .getMinutes()
        .toString()
        .padStart(2, "0");

      setCurrentTime(`${hours}:${minutes}`);
    };

    updateClock();

    const interval = setInterval(
      updateClock,
      1000
    );

    return () =>
      clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadData() {
      const savedData =
        await AsyncStorage.getItem(
          "moneyflow_data"
        );

      if (!savedData) return;

      const data = JSON.parse(savedData);

      setSalaryMode(
        data.salaryMode || "monthly"
      );

      setSalary(data.salary || "");

      setHourlySalary(
        data.hourlySalary || ""
      );

      setHoursPerWeek(
        data.hoursPerWeek || ""
      );

      setDaysPerWeek(
        data.daysPerWeek || ""
      );

      setStartDate(data.startDate || "");

      setStarted(data.started || false);

      setPaused(data.paused || false);

      if (
        data.started &&
        !data.paused &&
        data.lastTimestamp
      ) {
        const now = Date.now();

        const elapsed =
          (now - data.lastTimestamp) /
          1000;

        const perSecond =
          getPerSecond();

        const offlineMoney =
          perSecond * elapsed;

        setMoney(
          (data.money || 0) +
            offlineMoney
        );
      } else {
        setMoney(data.money || 0);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadSound() {
      const { sound } =
        await Audio.Sound.createAsync(
          require("../../assets/sounds/win.mp3")
        );

      soundRef.current = sound;
    }

    loadSound();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    async function saveData() {
      const data = {
        salaryMode,
        salary,
        hourlySalary,
        hoursPerWeek,
        daysPerWeek,
        startDate,
        money,
        started,
        paused,
        lastTimestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        "moneyflow_data",
        JSON.stringify(data)
      );
    }

    saveData();
  }, [
    salaryMode,
    salary,
    hourlySalary,
    hoursPerWeek,
    daysPerWeek,
    startDate,
    money,
    started,
    paused,
    lastTimestamp,
  ]);

  useEffect(() => {
    if (!started || paused) return;

    const perSecond =
      getPerSecond();

    if (!perSecond) return;

    setPerSecondDisplay(
      perSecond
    );

    const perMillisecond =
      perSecond / 1000;

    let lastUpdate = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();

      const delta =
        now - lastUpdate;

      setMoney((prev) => {
        const updated =
          prev +
          perMillisecond * delta;

        const currentEuro =
          Math.floor(updated);

        if (
          currentEuro >
          lastEuro.current
        ) {
          lastEuro.current =
            currentEuro;

          soundRef.current?.replayAsync();

          if (
            currentEuro % 10 ===
            0
          ) {
            triggerEuroAnimation();
          }
        }

        return updated;
      });

      setLastTimestamp(now);

      lastUpdate = now;
    }, 16);

    return () =>
      clearInterval(interval);
  }, [
    started,
    paused,
    salaryMode,
    salary,
    hourlySalary,
    hoursPerWeek,
  ]);

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      style={{
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {!started ? (
        <>
          <Text
            style={{
              color: "white",
              fontSize: 42,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            MoneyFlow
          </Text>

          <Text
            style={{
              color: "#777",
              fontSize: 16,
              marginBottom: 30,
            }}
          >
            Watch your salary grow live
          </Text>

          <View
            style={{
              flexDirection: "row",
              marginBottom: 20,
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                setSalaryMode(
                  "monthly"
                )
              }
              style={{
                flex: 1,
                backgroundColor:
                  salaryMode ===
                  "monthly"
                    ? "#00ff99"
                    : "#111",
                padding: 14,
                borderRadius: 16,
                alignItems:
                  "center",
              }}
            >
              <Text
                style={{
                  color:
                    salaryMode ===
                    "monthly"
                      ? "black"
                      : "white",
                  fontWeight:
                    "bold",
                }}
              >
                Mensuel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setSalaryMode(
                  "hourly"
                )
              }
              style={{
                flex: 1,
                backgroundColor:
                  salaryMode ===
                  "hourly"
                    ? "#00ff99"
                    : "#111",
                padding: 14,
                borderRadius: 16,
                alignItems:
                  "center",
              }}
            >
              <Text
                style={{
                  color:
                    salaryMode ===
                    "hourly"
                      ? "black"
                      : "white",
                  fontWeight:
                    "bold",
                }}
              >
                Horaire
              </Text>
            </TouchableOpacity>
          </View>

          {salaryMode ===
          "monthly" ? (
            <>
              <TextInput
                placeholder="Salaire mensuel (€)"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={salary}
                onChangeText={
                  setSalary
                }
                style={{
                  backgroundColor:
                    "#111",
                  color: "white",
                  padding: 18,
                  borderRadius: 18,
                  marginBottom: 16,
                  fontSize: 18,
                  borderWidth: 1,
                  borderColor:
                    "#1f1f1f",
                }}
              />

              <TextInput
                placeholder="Heures par semaine"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={
                  hoursPerWeek
                }
                onChangeText={
                  setHoursPerWeek
                }
                style={{
                  backgroundColor:
                    "#111",
                  color: "white",
                  padding: 18,
                  borderRadius: 18,
                  marginBottom: 16,
                  fontSize: 18,
                  borderWidth: 1,
                  borderColor:
                    "#1f1f1f",
                }}
              />
            </>
          ) : (
            <>
              <TextInput
                placeholder="Salaire horaire (€)"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={hourlySalary}
                onChangeText={
                  setHourlySalary
                }
                style={{
                  backgroundColor:
                    "#111",
                  color: "white",
                  padding: 18,
                  borderRadius: 18,
                  marginBottom: 16,
                  fontSize: 18,
                  borderWidth: 1,
                  borderColor:
                    "#1f1f1f",
                }}
              />

              <TextInput
                placeholder="Heures par semaine"
                placeholderTextColor="#666"
                keyboardType="numeric"
                value={
                  hoursPerWeek
                }
                onChangeText={
                  setHoursPerWeek
                }
                style={{
                  backgroundColor:
                    "#111",
                  color: "white",
                  padding: 18,
                  borderRadius: 18,
                  marginBottom: 16,
                  fontSize: 18,
                  borderWidth: 1,
                  borderColor:
                    "#1f1f1f",
                }}
              />
            </>
          )}

          <TextInput
            placeholder="Jours travaillés / semaine"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={daysPerWeek}
            onChangeText={
              setDaysPerWeek
            }
            style={{
              backgroundColor:
                "#111",
              color: "white",
              padding: 18,
              borderRadius: 18,
              marginBottom: 16,
              fontSize: 18,
              borderWidth: 1,
              borderColor:
                "#1f1f1f",
            }}
          />

          <TextInput
            placeholder="Date de départ (01/05/2026)"
            placeholderTextColor="#666"
            value={startDate}
            onChangeText={
              setStartDate
            }
            style={{
              backgroundColor:
                "#111",
              color: "white",
              padding: 18,
              borderRadius: 18,
              marginBottom: 28,
              fontSize: 18,
              borderWidth: 1,
              borderColor:
                "#1f1f1f",
            }}
          />

          <TouchableOpacity
            onPress={() => {
              setPaused(false);
              setStarted(true);
              setIsEditing(false);
            }}
            style={{
              backgroundColor:
                "#00ff99",
              padding: 20,
              borderRadius: 20,
              alignItems:
                "center",
            }}
          >
            <Text
              style={{
                color: "black",
                fontWeight:
                  "bold",
                fontSize: 18,
              }}
            >
              START
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent:
              "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              setMenuOpen(!menuOpen)
            }
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              zIndex: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 28,
                fontWeight: "bold",
              }}
            >
              ⋮
            </Text>
          </TouchableOpacity>

          {menuOpen && (
            <View
              style={{
                position: "absolute",
                top: 100,
                right: 20,
                backgroundColor: "#111",
                borderRadius: 16,
                padding: 10,
                borderWidth: 1,
                borderColor: "#222",
                zIndex: 20,
                width: 220,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  router.push("../stats");
                }}
                style={{
                  paddingVertical: 14,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  Voir les statistiques
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  backgroundColor: "#222",
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  router.push("../goals");
                }}
                style={{
                  paddingVertical: 14,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  Objectifs
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  backgroundColor: "#222",
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  setIsEditing(true);
                  setStarted(false);
                  setPaused(true);
                  setMenuOpen(false);
                }}
                style={{
                  paddingVertical: 14,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                  }}
                >
                  Changer mes revenus
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  height: 1,
                  backgroundColor: "#222",
                }}
              />

              <TouchableOpacity
                onPress={() => {
                  setStarted(false);
                  setPaused(false);
                  setMoney(0);
                  lastEuro.current = 0;
                  setMenuOpen(false);
                }}
                style={{
                  paddingVertical: 14,
                }}
              >
                <Text
                  style={{
                    color: "#ff4d4d",
                    fontSize: 16,
                  }}
                >
                  Reset le compteur
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {showEuroPopup && (
            <Animated.Text
              style={{
                position:
                  "absolute",
                top: 180,
                color:
                  "#00ff99",
                fontSize: 42,
                fontWeight:
                  "bold",
                opacity: fadeAnim,
              }}
            >
              +10€
            </Animated.Text>
          )}

          <Text
            style={{
              color: "#666",
              fontSize: 22,
              marginBottom: 30,
            }}
          >
            {currentTime}
          </Text>

          <View
            style={{
              shadowColor: "#00ff99",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.9,
              shadowRadius: 25,
              elevation: 30,
            }}
          >
            <Text
              style={{
                color: "#00ff99",
                fontSize: 72,
                fontWeight: "bold",

                textShadowColor:
                  "rgba(0,255,153,0.9)",

                textShadowOffset: {
                  width: 0,
                  height: 0,
                },

                textShadowRadius: 25,
              }}
            >
              {money.toFixed(3)} €
            </Text>
          </View>

          <Text
            style={{
              color: "#666",
              marginTop: 20,
            }}
          >
            gagné aujourd’hui
          </Text>

          <Text
            style={{
              color: "#00ff99",
              marginTop: 10,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            +
            {(perSecondDisplay * 60).toFixed(
              2
            )}{" "}
            €/min
          </Text>

          <TouchableOpacity
            onPress={() =>
              setPaused(!paused)
            }
            style={{
              marginTop: 40,
              backgroundColor:
                paused
                  ? "#00ff99"
                  : "#111",
              paddingVertical: 14,
              paddingHorizontal: 30,
              borderRadius: 18,
            }}
          >
            <Text
              style={{
                color: paused
                  ? "black"
                  : "white",
                fontSize: 16,
                fontWeight:
                  "600",
              }}
            >
              {paused
                ? "REPRENDRE"
                : "PAUSE"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}