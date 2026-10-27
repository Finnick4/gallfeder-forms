import type {NumberChartAssignment} from "../../shared/properties.ts";
import {Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis} from "recharts";
import {CustomTooltip} from "./CustomTooltip.tsx";

interface Properties {
    assignments: NumberChartAssignment[]
    isVertical?: boolean
}

const NumberBarChart = ({assignments, isVertical = false}: Properties ) => {
    return (
        <BarChart
            style={{ width: '100%', aspectRatio: 1.618 }}
            responsive
            data={assignments}
            dataKey={"value"}
            className="chart barchart"
            layout={isVertical ? "vertical" : "horizontal"}
        >
            <CartesianGrid
                horizontalFill={isVertical ? ["var(--element-color-muted)", "var(--element-color)"] : []}
                verticalFill={isVertical ? [] : ["var(--element-color-muted)", "var(--element-color)"]}
            />
            {
                isVertical ?
                    <>
                    <XAxis type="number" height="auto" allowDecimals={false} />
                    <YAxis type="category" dataKey="key" />
                    </>
                :
                    <>
                    <XAxis dataKey="key"/>
                    <YAxis width="auto" allowDecimals={false}/>
                    </>
            }
            <Tooltip
                cursor={{
                    fill: "var(--secondary-muted)",
                    opacity: .25
                }}
                content={CustomTooltip}
            />
            <Bar
                fill="var(--primary)"
                stroke="var(--primary-border-color)"
                strokeWidth="var(--border-width)"
                dataKey="value"
                radius={isVertical ? [0, 8, 8, 0] : [8, 8, 0, 0]}
                animationBegin={100}
                animationDuration={500}
            />
        </BarChart>
    );
}
export default NumberBarChart
