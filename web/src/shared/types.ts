
// @ts-ignore
export enum QuestionTypes {
    Invalid,
    Choice,
    Input,
}

export type Question = {
    id: UUID
    formID: UUID
    index: number
    type: QuestionTypes
    meta: QuestionMetadata
}

export type QuestionMetadata = {
    question: string
    choiceOptions?: ChoiceQuestionOption[]
    maximumChoices?: number
}

export type ChoiceQuestionOption = {
    text: string
}

export type UUID = string;

export type Form = {
    "id": UUID
    "title": string
    "description": string
    "questions": Question[]
}



