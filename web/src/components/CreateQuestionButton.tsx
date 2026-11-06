import {GoogleMaterialSymbol} from "./GoogleMaterialSymbol.tsx";
import {QUESTION_TYPES_SELECTOR_ENTRIES} from "../shared/types.ts";
import {QuestionTypeSelector} from "./QuestionTypeSelector.tsx";
import {useState} from "react";
import {QuestionTypes} from "../shared/enums.ts";
import "./CreateQuestionButton.css";
import {Button} from "./Button.tsx";

interface Properties {
    addQuestionCallback: (t: QuestionTypes) => void;
}

export const CreateQuestionButton = ({addQuestionCallback}: Properties) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <div className="add-question">
            <div className="head">
                <Button
                    styleType="secondary"
                    onClick={() => setExpanded(!expanded)}
                >
                    <GoogleMaterialSymbol iconName="add_circle" /> Add question
                </Button>
            </div>

            {expanded ?
                <QuestionTypeSelector entries={QUESTION_TYPES_SELECTOR_ENTRIES} onClick={addQuestionCallback} /> :
                <></>
            }
        </div>
    );
}