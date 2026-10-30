import {NumberTable} from "./NumberTable.tsx";
import type {NumberChartAssignment} from "../../shared/properties.ts";
import NumberBarChart from "./NumberBarChart.tsx";
import {NumberChartTypes} from "../../shared/enums.ts";
import {NumberPieChart} from "./NumberPieChart.tsx";

interface Properties {
    chartType: NumberChartTypes
    assignments: NumberChartAssignment[]
}

export const NumberCharts = ({chartType, assignments}: Properties) => {
    if (assignments.length == 0) {
        assignments = [{
            key: "Nothing...",
            value: 0
        }];
    }

    switch (chartType) {
        case NumberChartTypes.Table:
            return (<NumberTable assignments={assignments} />);
        case NumberChartTypes.BarChart:
            return (<NumberBarChart assignments={assignments} />);
        case NumberChartTypes.VerticalBarChart:
            return (<NumberBarChart assignments={assignments} isVertical={true} />);
        case NumberChartTypes.PieChart:
            return (<NumberPieChart assignments={assignments} />);
    }
}