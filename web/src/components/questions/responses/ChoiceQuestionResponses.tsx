import type {FormQuestionResponsesProperties, NumberChartAssignment} from "../../../shared/properties.ts";
import {useState} from "react";
import {NumberCharts} from "../../charts/NumberCharts.tsx";
import {NumberChartTypes} from "../../../shared/enums.ts";
import {ChartTypeSelector} from "../../charts/ChartTypeSelector.tsx";
import {NUMBER_CHART_TYPES_SELECTOR_ENTRIES} from "../../../shared/types.ts";

export const ChoiceQuestionResponses = ({question}: FormQuestionResponsesProperties) => {
    const [chartType, setChartType] = useState<NumberChartTypes>(NumberChartTypes.BarChart);

    return (
        <div
            className="question choice responses"
        >
            <h2>{question.meta.question}</h2>
            <ChartTypeSelector
                entries={NUMBER_CHART_TYPES_SELECTOR_ENTRIES}
                defaultSelected={NumberChartTypes.BarChart}
                onChange={type => setChartType(type)}
            />
            <NumberCharts
                chartType={chartType}
                assignments={question.meta.choiceOptionsResponse.map(opt => {
                    return {value: opt.timesChosen, key: opt.text} as NumberChartAssignment;
                })}
            >
            </NumberCharts>
        </div>
    );
}
