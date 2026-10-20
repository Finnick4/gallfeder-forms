import type {FormQuestionResponsesProperties, NumberChartAssignment} from "../../../shared/properties.ts";
import {useRef} from "react";
import {NumberCharts, NumberChartTypes} from "../../charts/NumberCharts.tsx";

export const ChoiceQuestionResponses = ({question}: FormQuestionResponsesProperties) => {
    const elem = useRef<HTMLDivElement>(null);

    return (
        <div
            className="question choice responses"
            ref={elem}
        >
            <h2>{question.meta.question}</h2>
            <NumberCharts
                chartType={NumberChartTypes.Table}
                assignments={question.meta.choiceOptionsResponse.map(opt => {
                    return {value: opt.timesChosen, key: opt.text} as NumberChartAssignment;
                })}
            >
            </NumberCharts>
        </div>
    );
}
