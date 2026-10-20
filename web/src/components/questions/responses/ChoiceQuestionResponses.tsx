import type {FormQuestionResponsesProperties} from "../../../shared/properties.ts";
import {useRef} from "react";

export const ChoiceQuestionResponses = ({question}: FormQuestionResponsesProperties) => {
    const elem = useRef<HTMLDivElement>(null);

    return (
        <div
            className="question choice responses"
            ref={elem}
        >
            <h2>{question.meta.question}</h2>
            <div className="options">
            {question.meta.choiceOptionsResponse.map((opt) => {
                return (
                    <div className="option">
                        <div className="text">{opt.text}</div>
                        <div className="times-chosen">{opt.timesChosen}</div>
                    </div>
                );
            })}
            </div>
        </div>
    );
}
