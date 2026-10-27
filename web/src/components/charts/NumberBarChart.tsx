import type {NumberChartAssignment} from "../../shared/properties.ts";
import {Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis} from "recharts";
import {CustomTooltip} from "./CustomTooltip.tsx";

interface Properties {
    assignments: NumberChartAssignment[]
}

const NumberBarChart = ({assignments}: Properties ) => {
    return (
        <BarChart
            style={{ width: '100%', aspectRatio: 1.618 }}
            responsive
            data={assignments}
            dataKey={"value"}
            className="chart barchart"
        >
            <CartesianGrid
                verticalFill={["var(--element-color-muted)", "var(--element-color)"]}
            />
            <XAxis dataKey="key" />
            <YAxis width="auto" allowDecimals={false} />
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
                radius={[8, 8, 0, 0]}
                animationBegin={100}
                animationDuration={500}
            />
        </BarChart>
    );
}
export default NumberBarChart
