
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

export type QuestionAnswer = {
    questionID: UUID
    type: QuestionTypes
    selectedChoices?: ChoiceQuestionOption[]
}

export type SendableQuestionAnswer = {
    questionID: UUID
    type: QuestionTypes
    selectedChoices?: ChoiceQuestionOption[]
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


export type FormEditChanges = {
    "title": string
    "description": string
    "removeDescription": boolean

    "questionChanges": QuestionEditChanges[]
}

export type QuestionEditChanges = {
    "id": UUID // if set, change edit the question, if not, create a new question
    "deleteQuestion"?:    boolean
    "index"?:             number
    "questionType"?:      QuestionTypes
    "overwriteMetadata"?: boolean
    "metadata"?:          QuestionMetadata
}


