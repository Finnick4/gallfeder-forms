import {NumberTable} from "./NumberTable.tsx";
import type {NumberChartAssignment} from "../../shared/properties.ts";

// @ts-ignore
export enum NumberChartTypes {
    Table,
}

interface Properties {
    chartType: NumberChartTypes
    assignments: NumberChartAssignment[]
}

export const NumberCharts = ({chartType, assignments}: Properties) => {
    switch (chartType) {
        case NumberChartTypes.Table:
            return (<NumberTable assignments={assignments}></NumberTable>);
    }
}