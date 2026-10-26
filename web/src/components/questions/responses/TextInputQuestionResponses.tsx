import type {FormQuestionResponsesProperties, NumberChartAssignment} from "../../../shared/properties.ts";
import {NumberCharts} from "../../charts/NumberCharts.tsx";
import {NumberChartTypes} from "../../../shared/enums.ts";

export const TextInputQuestionResponses = ({question}: FormQuestionResponsesProperties) => {
    const assignments: NumberChartAssignment[] = [];
    for (const wordCountElement of question.meta.submittedTextsAnalysis.wordOccurrences) {
        assignments.push({
            key: wordCountElement.word,
            value: wordCountElement.occurrence,
        } as NumberChartAssignment);
    }

    return (
        <div
            className="question text responses"
        >
            <h2>{question.meta.question}</h2>
            <NumberCharts
                chartType={NumberChartTypes.BarChart}
                assignments={assignments}
            >
            </NumberCharts>
        </div>
    );
}
