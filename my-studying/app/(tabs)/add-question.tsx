import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";

function AddQuestion() {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleCreate = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Question and Answer are required.");
      return;
    }

    const { error } = await supabase.from("questions").insert({
      question: question.trim(),
      answer: answer.trim(),
      description: description.trim() || null,
    });

    if (error) {
      Alert.alert("Could not create question", error.message);
      return;
    }

    setQuestion("");
    setAnswer("");
    setDescription("");
    Alert.alert("Question created");
  };

  return (
    <View style={styles.container}>
      {/* Question */}
      <Text style={styles.label}>Question</Text>
      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="Enter question..."
        placeholderTextColor="#999"
        
      />

      {/* Answer */}
      <Text style={styles.label}>Answer</Text>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Enter answer..."
        placeholderTextColor="#999"
      />

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description..."
        placeholderTextColor="#999"
        multiline
      />

      <Pressable
        accessibilityRole="button"
        onPress={handleCreate}
        style={({ pressed }) => [styles.createButton, pressed && styles.createButtonPressed]}
      >
        <Text style={styles.createButtonText}>Create</Text>
      </Pressable>
    </View>
  );
}

export default AddQuestion;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "white",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#80AB82",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top", // Androidで上寄せ
  },
  createButton: {
    alignItems: "center",
    backgroundColor: "#80AB82",
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 12,
  },
  createButtonPressed: {
    opacity: 0.7,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
