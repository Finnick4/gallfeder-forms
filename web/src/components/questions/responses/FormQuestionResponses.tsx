import {ChoiceQuestionResponses} from "./ChoiceQuestionResponses.tsx";
import {QuestionTypes} from "../../../shared/enums.ts";
import type {FormQuestionResponsesProperties} from "../../../shared/properties.ts";

export const FormQuestionResponses = ({question}: FormQuestionResponsesProperties) => {
    if (question.type == QuestionTypes.Choice) {
        return (<ChoiceQuestionResponses question={question}></ChoiceQuestionResponses>);
    }

    console.error("Failed to deduce question type of parsed question for a FormQuestionResponses component!");
    return (<div className="question">
        <h2>{question.meta.question}</h2>
        <div>This question could not be interpreted (Type {question.type})!</div>
    </div>);
}