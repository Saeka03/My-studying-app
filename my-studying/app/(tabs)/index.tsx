import AddButton from "@/components/AddButton";
import Empty from "@/components/Empty";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Question = {
  id: string;
  question: string;
  answer: string;
  description: string | null;
};

const QUESTION_PAGE_SIZE = 1000;

export default function App() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [editedQuestion, setEditedQuestion] = useState("");
  const [editedAnswer, setEditedAnswer] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const allQuestions: Question[] = [];
    let from = 0;
    let loadError = "";

    while (!loadError) {
      const { data, error } = await supabase
        .from("questions")
        .select("id, question, answer, description")
        .order("created_at", { ascending: false })
        .range(from, from + QUESTION_PAGE_SIZE - 1);

      if (error) {
        loadError = error.message;
        break;
      }

      const page = data ?? [];
      allQuestions.push(...page);

      if (page.length < QUESTION_PAGE_SIZE) {
        break;
      }

      from += QUESTION_PAGE_SIZE;
    }

    if (loadError) {
      setErrorMessage(`Could not load questions: ${loadError}`);
      setQuestions([]);
    } else {
      setQuestions(allQuestions);
    }

    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadQuestions();
    }, [loadQuestions]),
  );

  const handleDelete = async () => {
    if (!selectedQuestion) {
      return;
    }

    setIsDeleting(true);
    setModalErrorMessage("");

    const { data: deletedQuestions, error } = await supabase
      .from("questions")
      .delete()
      .eq("id", selectedQuestion.id)
      .select("id");

    if (error) {
      setModalErrorMessage(`Could not delete question: ${error.message}`);
      setIsDeleting(false);
      return;
    }

    if (!deletedQuestions?.length) {
      setModalErrorMessage("Could not delete question: no matching row was deleted.");
      setIsDeleting(false);
      return;
    }

    await loadQuestions();
    setIsDeleting(false);
    setSelectedQuestion(null);
  };

  const handleSave = async () => {
    if (!selectedQuestion) {
      return;
    }

    const emptyField = [
      { label: "Question", value: editedQuestion },
      { label: "Answer", value: editedAnswer },
      { label: "Description", value: editedDescription },
    ].find((field) => !field.value.trim());

    if (emptyField) {
      setModalErrorMessage(`${emptyField.label} is empty.`);
      return;
    }

    setIsSaving(true);
    setModalErrorMessage("");

    const { data: updatedQuestions, error } = await supabase
      .from("questions")
      .update({
        question: editedQuestion.trim(),
        answer: editedAnswer.trim(),
        description: editedDescription.trim(),
      })
      .eq("id", selectedQuestion.id)
      .select("id");

    if (error) {
      setModalErrorMessage(`Could not save question: ${error.message}`);
      setIsSaving(false);
      return;
    }

    if (!updatedQuestions?.length) {
      setModalErrorMessage("Could not save question: no matching row was updated.");
      setIsSaving(false);
      return;
    }

    setSelectedQuestion({
      ...selectedQuestion,
      question: editedQuestion.trim(),
      answer: editedAnswer.trim(),
      description: editedDescription.trim(),
    });
    await loadQuestions();
    setIsSaving(false);
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centeredContent}>
          <ActivityIndicator color="#80AB82" size="large" />
        </View>
      ) : errorMessage ? (
        <View style={styles.centeredContent}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <Pressable onPress={loadQuestions} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.centeredContent}>
          <Empty />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={questions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open question: ${item.question}`}
              onPress={() => {
                setModalErrorMessage("");
                setEditedQuestion(item.question);
                setEditedAnswer(item.answer);
                setEditedDescription(item.description ?? "");
                setSelectedQuestion(item);
              }}
              style={({ pressed }) => [styles.questionCard, pressed && styles.questionCardPressed]}
            >
              <Text style={styles.questionTitle}>{item.question}</Text>
            </Pressable>
          )}
        />
      )}

      <View style={styles.buttonWrapper}>
        <AddButton onPress={() => router.push("/add-question")} />
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={selectedQuestion !== null}
        onRequestClose={() => setSelectedQuestion(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close question details"
            onPress={() => setSelectedQuestion(null)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <Pressable
              accessibilityLabel="Close question details"
              disabled={isSaving || isDeleting}
              onPress={() => setSelectedQuestion(null)}
              style={({ pressed }) => [styles.closeIconButton, pressed && styles.closeIconPressed]}
            >
              <Text style={styles.closeIcon}>×</Text>
            </Pressable>
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Question</Text>
              <TextInput
                editable={!isSaving && !isDeleting}
                onChangeText={setEditedQuestion}
                style={styles.modalInput}
                value={editedQuestion}
              />
              <Text style={styles.modalLabel}>Answer</Text>
              <TextInput
                editable={!isSaving && !isDeleting}
                onChangeText={setEditedAnswer}
                style={styles.modalInput}
                value={editedAnswer}
              />
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                editable={!isSaving && !isDeleting}
                multiline
                onChangeText={setEditedDescription}
                style={[styles.modalInput, styles.modalTextArea]}
                value={editedDescription}
              />
              {modalErrorMessage ? (
                <Text style={styles.modalErrorMessage}>{modalErrorMessage}</Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={isSaving || isDeleting}
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.saveButton,
                  (pressed || isSaving || isDeleting) && styles.saveButtonPressed,
                ]}
              >
                <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save"}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                onPress={handleDelete}
                style={({ pressed }) => [
                  styles.deleteButton,
                  (pressed || isDeleting) && styles.deleteButtonPressed,
                ]}
              >
                <Text style={styles.deleteButtonText}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF7",
  },
  centeredContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  listContent: {
    padding: 20,
    paddingBottom: 90,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE9DD",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 12,
    padding: 18,
    shadowColor: "#406142",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  questionCardPressed: {
    backgroundColor: "#EEF6EF",
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  questionTitle: {
    color: "#29412B",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 25,
  },
  buttonWrapper: {
    bottom: 24,
    position: "absolute",
    right: 24,
  },
  errorMessage: {
    color: "#B3261E",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#80AB82",
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    elevation: 8,
    overflow: "hidden",
    maxWidth: 440,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    width: "100%",
  },
  closeIconButton: {
    alignItems: "center",
    backgroundColor: "#EEF6EF",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 14,
    top: 14,
    width: 36,
    zIndex: 1,
  },
  closeIconPressed: {
    backgroundColor: "#D1E4D2",
  },
  closeIcon: {
    color: "#385C3A",
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 32,
  },
  modalContent: {
    padding: 24,
    paddingTop: 64,
  },
  modalLabel: {
    color: "#668169",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  modalText: {
    color: "#263A28",
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 20,
  },
  modalInput: {
    borderColor: "#C9D9CB",
    borderRadius: 8,
    borderWidth: 1,
    color: "#263A28",
    fontSize: 17,
    marginBottom: 20,
    padding: 12,
  },
  modalTextArea: {
    height: 96,
    textAlignVertical: "top",
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#80AB82",
    borderRadius: 8,
    marginBottom: 10,
    paddingVertical: 11,
  },
  saveButtonPressed: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    alignItems: "center",
    borderColor: "#C94343",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingVertical: 11,
  },
  deleteButtonPressed: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: "#C94343",
    fontSize: 16,
    fontWeight: "600",
  },
  modalErrorMessage: {
    color: "#B3261E",
    fontSize: 14,
    marginBottom: 14,
  },
});
