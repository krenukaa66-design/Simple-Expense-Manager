import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function App() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense"); // expense or income
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("@entries");
      if (jsonValue != null) {
        setEntries(JSON.parse(jsonValue));
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load entries");
    }
  };

  const saveEntries = async (newEntries) => {
    try {
      const jsonValue = JSON.stringify(newEntries);
      await AsyncStorage.setItem("@entries", jsonValue);
    } catch (e) {
      Alert.alert("Error", "Failed to save entries");
    }
  };

  const addEntry = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount greater than 0");
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      amount: amt,
      type,
      date: new Date().toISOString(),
    };

    const newEntries = [newEntry, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries);
    setAmount("");
  };

  const getBalance = () => {
    let income = 0;
    let expense = 0;
    entries.forEach((e) => {
      if (e.type === "income") income += e.amount;
      else expense += e.amount;
    });
    return income - expense;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Expense Manager</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "expense" && styles.selectedButton,
            ]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.typeText,
                type === "expense" && styles.selectedText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "income" && styles.selectedButton,
            ]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.typeText,
                type === "income" && styles.selectedText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button title="Add Entry" onPress={addEntry} />

      <Text style={styles.balance}>Balance: ${getBalance().toFixed(2)}</Text>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.entry}>
            <Text style={{ color: item.type === "income" ? "green" : "red" }}>
              {item.type.toUpperCase()} : ${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.date}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No entries yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderColor: "#aaa",
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  buttonGroup: {
    flexDirection: "row",
  },
  typeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 5,
    marginRight: 5,
  },
  selectedButton: {
    backgroundColor: "#007bff",
  },
  typeText: {
    color: "#000",
    fontWeight: "bold",
  },
  selectedText: {
    color: "white",
  },
  balance: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
  },
  list: {
    flex: 1,
    marginTop: 10,
  },
  entry: {
    padding: 15,
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 5,
    elevation: 1,
  },
  date: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
  },
});
