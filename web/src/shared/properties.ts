import type {Question, QuestionAnswer, QuestionResponses, UUID} from "./types.ts";

export interface FormQuestionProperties {
    question: Question;
    respondableSettings: RespondableQuestionDataset | undefined;
    editableSettings: EditableQuestionDataset | undefined;
}

export interface FormQuestionResponsesProperties {
    question: QuestionResponses;
}

export interface RespondableQuestionDataset {
    currentAnswer: QuestionAnswer;
    answerChangeCallback: (answer: QuestionAnswer) => void;
}

export interface EditableQuestionDataset {
    questionEditedCallback: (question: Question) => void;
    currentlyFocussed: UUID;
    notifyFocus: () => void;
}

export interface NumberChartAssignment {
    key: string
    value: number
    fill?: string
}
