import type {Question, QuestionAnswer} from "./types.ts";

export interface FormQuestionProperties {
    question: Question;
    respondableSettings: RespondableQuestionDataset | undefined;
    editableSettings: EditableQuestionDataset | undefined;
}

export interface RespondableQuestionDataset {
    currentAnswer: QuestionAnswer;
    answerChangeCallback: (answer: QuestionAnswer) => void;
}

export interface EditableQuestionDataset {
    questionEditedCallback: (question: Question) => void;
}
