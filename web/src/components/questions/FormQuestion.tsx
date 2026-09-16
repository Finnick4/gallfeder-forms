import {QuestionTypes} from "../../shared/types.ts";
import {ChoiceQuestion} from "./ChoiceQuestion.tsx";
import type {FormQuestionProperties} from "../../shared/properties.ts";



export const FormQuestion = ({question, respondableSettings, editableSettings}: FormQuestionProperties) => {
    if (question.type == QuestionTypes.Choice) {
        return (<ChoiceQuestion question={question} respondableSettings={respondableSettings} editableSettings={editableSettings}></ChoiceQuestion>);
    }
    if (question.type == QuestionTypes.Input) {
        console.error("Text input components are not yet implemented!");
        return (<h1>Text Input</h1>);
    }

    console.error("Failed to deduce question type of parsed question for a FormQuestion component!");
    return (<h1>Invalid</h1>);
}
