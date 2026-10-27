import type {NumberChartAssignment} from "../../shared/properties.ts";
import {
    Legend,
    Pie,
    PieChart,
    Tooltip
} from "recharts";
import {CustomTooltip} from "./CustomTooltip.tsx";
import {ChartColorer} from "../../shared/ChartColorer.ts";


interface Properties {
    assignments: NumberChartAssignment[]
}

export const NumberPieChart = ({assignments}: Properties ) => {
    const color = new ChartColorer();
    for (const assignment of assignments) {
        if (assignment.fill == undefined) {
            assignment.fill = color.getColor();
        }
    }

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
                stroke={"none"}
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
