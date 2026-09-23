import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Question = {
  id: string;
  question: string;
  answer: string;
  description: string | null;
};

const QUESTION_PAGE_SIZE = 1000;

export default function Practice() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const currentQuestionIdRef = useRef<string | null>(null);
  const answerAnimation = useRef(new Animated.Value(0)).current;

  const loadRandomQuestion = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    setIsAnswerVisible(false);
    answerAnimation.setValue(0);

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
      setCurrentQuestion(null);
      currentQuestionIdRef.current = null;
    } else if (allQuestions.length === 0) {
      setCurrentQuestion(null);
      currentQuestionIdRef.current = null;
    } else {
      const candidates =
        allQuestions.length > 1
          ? allQuestions.filter((question) => question.id !== currentQuestionIdRef.current)
          : allQuestions;
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const nextQuestion = candidates[randomIndex];
      currentQuestionIdRef.current = nextQuestion.id;
      setCurrentQuestion(nextQuestion);
    }

    setIsLoading(false);
  }, [answerAnimation]);

  const toggleAnswer = () => {
    const willShowAnswer = !isAnswerVisible;
    setIsAnswerVisible(willShowAnswer);

    Animated.timing(answerAnimation, {
      toValue: willShowAnswer ? 1 : 0,
      duration: 240,
      useNativeDriver: false,
    }).start();
  };

  useFocusEffect(
    useCallback(() => {
      loadRandomQuestion();
    }, [loadRandomQuestion]),
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centeredContent}>
          <ActivityIndicator color="#80AB82" size="large" />
        </View>
      ) : errorMessage ? (
        <View style={styles.centeredContent}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <Pressable onPress={loadRandomQuestion} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : !currentQuestion ? (
        <View style={styles.centeredContent}>
          <Text style={styles.emptyTitle}>No questions yet</Text>
          <Text style={styles.emptyDescription}>Add a question to start practicing.</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.eyebrow}>QUESTION</Text>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isAnswerVisible }}
            onPress={toggleAnswer}
            style={({ pressed }) => [styles.answerToggle, pressed && styles.answerTogglePressed]}
          >
            <Text style={styles.disclosureIcon}>{isAnswerVisible ? "▼" : "▶"}</Text>
            <Text style={styles.toggleLabel}>Show answer</Text>
          </Pressable>

          <Animated.View
            style={[
              styles.answerWrapper,
              {
                maxHeight: answerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 600],
                }),
                opacity: answerAnimation,
                transform: [
                  {
                    translateY: answerAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.answerCard}>
              <Text style={styles.answerLabel}>ANSWER</Text>
              <Text style={styles.answerText}>{currentQuestion.answer}</Text>
              <Text style={styles.answerLabel}>DESCRIPTION</Text>
              <Text style={styles.descriptionText}>{currentQuestion.description || "-"}</Text>
            </View>
          </Animated.View>

          <Pressable
            accessibilityRole="button"
            onPress={loadRandomQuestion}
            style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7FAF7",
    flex: 1,
  },
  centeredContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  eyebrow: {
    color: "#668169",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE9DD",
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    minHeight: 190,
    justifyContent: "center",
    padding: 24,
    shadowColor: "#406142",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  questionText: {
    color: "#29412B",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 34,
    textAlign: "center",
  },
  answerToggle: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EAF4EB",
    borderRadius: 20,
    flexDirection: "row",
    marginVertical: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  answerTogglePressed: {
    opacity: 0.7,
  },
  toggleLabel: {
    color: "#385C3A",
    fontSize: 16,
    fontWeight: "600",
  },
  disclosureIcon: {
    color: "#385C3A",
    fontSize: 15,
    marginRight: 8,
  },
  answerWrapper: {
    overflow: "hidden",
  },
  answerCard: {
    backgroundColor: "#EAF4EB",
    borderRadius: 14,
    padding: 20,
  },
  answerLabel: {
    color: "#668169",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  answerText: {
    color: "#263A28",
    fontSize: 19,
    fontWeight: "600",
    lineHeight: 28,
    marginBottom: 20,
  },
  descriptionText: {
    color: "#263A28",
    fontSize: 16,
    lineHeight: 24,
  },
  nextButton: {
    alignItems: "center",
    backgroundColor: "#80AB82",
    borderRadius: 10,
    marginTop: "auto",
    paddingVertical: 14,
  },
  nextButtonPressed: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  errorMessage: {
    color: "#B3261E",
    fontSize: 16,
    textAlign: "center",
  },
  emptyTitle: {
    color: "#29412B",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyDescription: {
    color: "#668169",
    fontSize: 16,
    textAlign: "center",
  },
});
