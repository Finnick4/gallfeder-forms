import {GoogleMaterialSymbol} from "./GoogleMaterialSymbol.tsx";
import {QUESTION_TYPES_SELECTOR_ENTRIES} from "../shared/types.ts";
import {QuestionTypeSelector} from "./QuestionTypeSelector.tsx";
import {useState} from "react";
import {QuestionTypes} from "../shared/enums.ts";
import "./CreateQuestionButton.css";

interface Properties {
    addQuestionCallback: (t: QuestionTypes) => void;
}

export const CreateQuestionButton = ({addQuestionCallback}: Properties) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <div className="add-question">
            <div className="head">
                <button
                    onClick={() => setExpanded(!expanded)}
                >
                    <GoogleMaterialSymbol iconName="add_circle" /> Add question
                </button>
            </div>

            {expanded ?
                <QuestionTypeSelector entries={QUESTION_TYPES_SELECTOR_ENTRIES} onClick={addQuestionCallback} /> :
                <></>
            }
        </div>
    );
}