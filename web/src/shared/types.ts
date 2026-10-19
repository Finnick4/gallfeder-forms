
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
    meta: QuestionAnswerMetadata
}
export type QuestionAnswerMetadata = {
    selectedChoices?: ChoiceQuestionOption[]
    writtenText?: string
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

export type ChoiceQuestionOptionResponses = {
    "text": string
    "timesChosen": number
}

export type UUID = string;

export const NIL_UUID: UUID = "00000000-0000-0000-0000-000000000000"

export type Form = {
    "id": UUID
    "title": string
    "description": string
    "questions": Question[]
}

export type FormOverview = {
    "id": UUID
    "title": string
    "description": string
    "questions": number
    "responses": number
}

export type FormResponses = {
    "id": UUID
    "title": string
    "description": string
    "totalResponses": number
    "questionResponses": QuestionResponses[]
}

export const makeFormFromResponses = (resp: FormResponses): Form => {
    return {
        id: resp.id,
        title: resp.title,
        description: resp.description,
        questions: resp.questionResponses.map(r => {
            return {
                id: r.questionID,
                formID: r.formID,
                index: r.index,
                type: r.type,
                meta: r.meta
            }
        })
    }
}

export type QuestionResponses = {
    "questionID": UUID
    "formID": UUID
    "index": number
    "type": QuestionTypes
    "meta": QuestionResponseMetadata
}

export type QuestionResponseMetadata = {
    "question": string
    "choiceOptionsResponse": ChoiceQuestionOptionResponses[]
    "maximumChoices": number
    "submittedTexts": string[]
    "responses": number
    "chosenOptions": number
}

export type HTTPResponse<T> = {
    "code": number
    "data": T
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

