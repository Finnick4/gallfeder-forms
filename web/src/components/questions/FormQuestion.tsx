import {QuestionTypes} from "../../shared/enums.ts";
import {ChoiceQuestion} from "./ChoiceQuestion.tsx";
import type {FormQuestionProperties} from "../../shared/properties.ts";
import {TextInputQuestion} from "./TextInputQuestion.tsx";
import {InternalNoticeMockQuestion} from "./InternalNoticeMockQuestion.tsx";
import type {ReactElement} from "react";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";
import {QuestionTypeSelector} from "./QuestionTypeSelector.tsx";
import {QUESTION_TYPES_SELECTOR_ENTRIES} from "../../shared/types.ts";

interface Properties extends FormQuestionProperties{
    addQuestionCallback?: (t: QuestionTypes) => void;
}

export const FormQuestion = ({question, respondableSettings, editableSettings, addQuestionCallback}: Properties) => {
    let qElem: ReactElement = <h3>Invalid question type</h3>;
    if (question.type == QuestionTypes.Choice) {
        qElem = <ChoiceQuestion
            question={question}
            respondableSettings={respondableSettings}
            editableSettings={editableSettings}
        />;
    }
    if (question.type == QuestionTypes.Input) {
        qElem = <TextInputQuestion
            question={question}
            respondableSettings={respondableSettings}
            editableSettings={editableSettings}
        />;
    }
    if (question.type == QuestionTypes.InternalNotice) {
        qElem = <InternalNoticeMockQuestion
            question={question}
            respondableSettings={respondableSettings}
            editableSettings={editableSettings}
        />;
    }

    const isFocussed = editableSettings?.currentlyFocussed == question.id;

    return (<>
        {qElem}
        {isFocussed && addQuestionCallback ?
            <div className="add-question">
                <div className="head"><GoogleMaterialSymbol iconName="add_circle" /> Add question</div>
                <QuestionTypeSelector entries={QUESTION_TYPES_SELECTOR_ENTRIES} onClick={addQuestionCallback} />
            </div>
            : <></>}
    </>)
}
