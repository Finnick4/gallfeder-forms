import type {FormQuestionResponsesProperties, NumberChartAssignment} from "../../../shared/properties.ts";
import {NumberCharts} from "../../charts/NumberCharts.tsx";
import {NumberChartTypes} from "../../../shared/enums.ts";
import {getWordCountFromTextResponses} from "../../../shared/word_analysis.ts";

export const TextInputQuestionResponses = ({question}: FormQuestionResponsesProperties) => {
    const wordCount = getWordCountFromTextResponses(question.meta.submittedTexts)
    const assignments: NumberChartAssignment[] = [];
    for (const wordCountElement of wordCount) {
        assignments.push({
            key: wordCountElement[0],
            value: wordCountElement[1]
        } as NumberChartAssignment)
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
