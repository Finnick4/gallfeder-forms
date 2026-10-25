import type {NumberChartAssignment} from "../../shared/properties.ts";
import {
    Legend,
    Pie,
    PieChart,
    Tooltip
} from "recharts";
import {CustomTooltip} from "./CustomTooltip.tsx";


interface Properties {
    assignments: NumberChartAssignment[]
}
const COLORS = [
    "#ffb627",
    "#0091f7",
    "#9bc53d",
    "#f20089",
    "#fa7921",
    "#8ecae6",
    "#e55934",
    "#f4afab",
];

export const NumberPieChart = ({assignments}: Properties ) => {
    let assignedColors = 0;
    for (const assignment of assignments) {
        if (assignment.fill == undefined) {
            assignment.fill = COLORS[assignedColors++ % COLORS.length];
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
