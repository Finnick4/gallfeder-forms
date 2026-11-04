import type {FormQuestionResponsesProperties, NumberChartAssignment} from "../../../shared/properties.ts";
import {NumberCharts} from "../../charts/NumberCharts.tsx";
import {NumberChartTypes} from "../../../shared/enums.ts";
import {useState} from "react";
import {NUMBER_CHART_TYPES_SELECTOR_ENTRIES} from "../../../shared/types.ts";
import {ChartTypeSelector} from "../../charts/ChartTypeSelector.tsx";

export const TextInputQuestionResponses = ({question}: FormQuestionResponsesProperties) => {
    const [chartType, setChartType] = useState<NumberChartTypes>(NumberChartTypes.BarChart);

    const assignments: NumberChartAssignment[] = [];
    let wordCount = 0;
    for (const wordCountElement of question.meta.submittedTextsAnalysis.wordOccurrences) {
        assignments.push({
            key: wordCountElement.word,
            value: wordCountElement.occurrence,
        } as NumberChartAssignment);
        wordCount += wordCountElement.occurrence;
    }
    const furtherWords = question.meta.submittedTextsAnalysis.totalWords - wordCount;
    if (chartType == NumberChartTypes.Table && furtherWords != 0) {
        assignments.push({
            key: "(further words)",
            value: furtherWords,
        } as NumberChartAssignment);
    }

    return (
        <div
            className="question text responses"
        >
            <h2>{question.meta.question}</h2>
            <ChartTypeSelector
                entries={NUMBER_CHART_TYPES_SELECTOR_ENTRIES}
                defaultSelected={NumberChartTypes.BarChart}
                onChange={type => setChartType(type)}
                identifier={`${question.formID}---${question.id}`}
            />
            <NumberCharts
                chartType={chartType}
                assignments={assignments}
            >
            </NumberCharts>
        </div>
    );
}
