import type {Question, QuestionAnswer} from "./types.ts";

export interface FormQuestionProperties {
    question: Question;
    currentAnswer: QuestionAnswer;
    answerChangeCallback: (answer: QuestionAnswer) => void;
}