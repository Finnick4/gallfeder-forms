import {NumberChartTypes, QuestionTypes} from "./enums.ts";


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
    "submittedTextsAnalysis": TextAnalysis
    "responses": number
    "chosenOptions": number
}

export type TextAnalysis = {
    "samples": number
    "totalWords": number
    "wordOccurrences": WordOccurrence[]
}

export type WordOccurrence = {
    "word": string
    "occurrence": number
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

export type AllowedGoogleMaterialSymbol = "add"
    | "add_circle"
    | "arrow_back"
    | "arrow_downward"
    | "arrow_upward"
    | "bar_chart"
    | "how_to_vote"
    | "login"
    | "pie_chart"
    | "progress_activity"
    | "question_mark"
    | "radio_button_checked"
    | "save"
    | "swap_vert"
    | "table"
    | "text_fields"
    | "vertical_bar_chart";

export interface TypeSelectorEntry<T> {
    name: string
    icon: AllowedGoogleMaterialSymbol
    storedType: T
}

export const NUMBER_CHART_TYPES_SELECTOR_ENTRIES: ReadonlyArray<TypeSelectorEntry<NumberChartTypes>> = [
    {
        name: "Table",
        icon: "table",
        storedType: NumberChartTypes.Table
    },
    {
        name: "Bar chart",
        icon: "bar_chart",
        storedType: NumberChartTypes.BarChart
    },
    {
        name: "Vertical bar chart",
        icon: "vertical_bar_chart",
        storedType: NumberChartTypes.VerticalBarChart
    },
    {
        name: "Pie chart",
        icon: "pie_chart",
        storedType: NumberChartTypes.PieChart
    },
]

export const QUESTION_TYPES_SELECTOR_ENTRIES: ReadonlyArray<TypeSelectorEntry<QuestionTypes>> = [
    {
        name: "Choice",
        icon: "radio_button_checked",
        storedType: QuestionTypes.Choice
    },
    {
        name: "Text input",
        icon: "text_fields",
        storedType: QuestionTypes.Input
    },
]
