import {NumberTable} from "./NumberTable.tsx";
import type {NumberChartAssignment} from "../../shared/properties.ts";
import NumberBarChart from "./NumberBarChart.tsx";
import {NumberChartTypes} from "../../shared/enums.ts";

interface Properties {
    chartType: NumberChartTypes
    assignments: NumberChartAssignment[]
}

export const NumberCharts = ({chartType, assignments}: Properties) => {
    switch (chartType) {
        case NumberChartTypes.Table:
            return (<NumberTable assignments={assignments}></NumberTable>);
        case NumberChartTypes.BarChart:
            return (<NumberBarChart assignments={assignments}></NumberBarChart>);
    }
}