import {QuestionTypes} from "../../shared/enums.ts";
import {ChoiceQuestion} from "./ChoiceQuestion.tsx";
import type {FormQuestionProperties} from "../../shared/properties.ts";
import {TextInputQuestion} from "./TextInputQuestion.tsx";
import {InternalNoticeMockQuestion} from "./InternalNoticeMockQuestion.tsx";

export const FormQuestion = ({question, respondableSettings, editableSettings}: FormQuestionProperties) => {
    if (question.type == QuestionTypes.Choice) {
        return (<ChoiceQuestion
            question={question}
            respondableSettings={respondableSettings}
            editableSettings={editableSettings}
        />);
    }
    if (question.type == QuestionTypes.Input) {
        return (<TextInputQuestion
            question={question}
            respondableSettings={respondableSettings}
            editableSettings={editableSettings}
        />);
    }
    if (question.type == QuestionTypes.InternalNotice) {
        return (<InternalNoticeMockQuestion
            question={question}
            respondableSettings={respondableSettings}
            editableSettings={editableSettings}
        />)
    }

    console.error("Failed to deduce question type of parsed question for a FormQuestion component!");
    return (<h3>Invalid question type</h3>);
}
