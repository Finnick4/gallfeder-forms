import {type Question, QuestionTypes} from "../../shared/types.ts";
import {ChoiceQuestion} from "./ChoiceQuestion.tsx";

interface Properties {
   question: Question
}

export const FormQuestion = ({question}: Properties) => {
    if (question.type == QuestionTypes.Choice) {
        return (<ChoiceQuestion question={question}></ChoiceQuestion>);
    }
    if (question.type == QuestionTypes.Input) {
        console.error("Text input components are not yet implemented!");
        return (<h1>Text Input</h1>);
    }

    console.error("Failed to deduce question type of parsed question for a FormQuestion component!");
    return (<h1>Invalid</h1>);
}
