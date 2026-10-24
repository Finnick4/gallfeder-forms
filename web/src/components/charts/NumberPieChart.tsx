import type {NumberChartAssignment} from "../../shared/properties.ts";
import {Legend, Pie, PieChart, Tooltip} from "recharts";
import {CustomTooltip} from "./CustomTooltip.tsx";


interface Properties {
    assignments: NumberChartAssignment[]
}

export const NumberPieChart = ({assignments}: Properties ) => {
    return (
        <PieChart
            style={{
                width: "100%",
                aspectRatio: 1
            }}
            className="chart piechart"
            responsive
        >
            <Pie
                data={assignments}
                dataKey={"value"}
                nameKey={"key"}
                label
                animationBegin={100}
                animationDuration={500}
                style={{width: "50%"}}
            />
            <Tooltip
                cursor={{
                    fill: "var(--secondary-muted)",
                    opacity: .25
                }}
                content={CustomTooltip}
            />
            <Legend
                position={"right"}
                width={1000}
            />
        </PieChart>
    );
}
