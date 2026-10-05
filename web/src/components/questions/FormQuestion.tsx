import {QuestionTypes} from "../../shared/types.ts";
import {ChoiceQuestion} from "./ChoiceQuestion.tsx";
import type {FormQuestionProperties} from "../../shared/properties.ts";
import {TextInputQuestion} from "./TextInputQuestion.tsx";



export const FormQuestion = ({question, respondableSettings, editableSettings}: FormQuestionProperties) => {
    if (question.type == QuestionTypes.Choice) {
        return (<ChoiceQuestion question={question} respondableSettings={respondableSettings} editableSettings={editableSettings}></ChoiceQuestion>);
    }
    if (question.type == QuestionTypes.Input) {
        return (<TextInputQuestion question={question} respondableSettings={respondableSettings} editableSettings={editableSettings}></TextInputQuestion>);
    }

    console.error("Failed to deduce question type of parsed question for a FormQuestion component!");
    return (<h1>Invalid</h1>);
}
