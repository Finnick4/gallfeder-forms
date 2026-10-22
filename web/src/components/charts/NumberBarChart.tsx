import type {NumberChartAssignment} from "../../shared/properties.ts";
import {Bar, BarChart, CartesianGrid, Tooltip, type TooltipContentProps, XAxis, YAxis} from "recharts";

interface Properties {
    assignments: NumberChartAssignment[]
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
    const firstPayload = payload?.[0];
    const isVisible = active && firstPayload != null;
    return (
        <div className="chart-tooltip">
            {isVisible && (
                <div className="label">{`${label}: ${firstPayload.value}`}</div>
            )}
        </div>
    );
};


const NumberBarChart = ({assignments}: Properties ) => {
    return (
        <BarChart
            style={{ width: '100%', aspectRatio: 1.618 }}
            responsive
            data={assignments}
            dataKey={"value"}
        >
            <CartesianGrid />
            <XAxis dataKey="key" />
            <YAxis width="auto" allowDecimals={false} />
            <Tooltip
                cursor={{
                    fill: "var(--secondary-muted)",
                    opacity: .25
                }}
                contentStyle={{
                    backgroundColor: "var(--element-color)",
                    border: "var(--element-border)",
                    borderRadius: 8,
                }}
                content={CustomTooltip}
            />
            <Bar
                fill="var(--primary)"
                stroke="var(--primary-border-color)"
                strokeWidth="var(--border-width)"
                dataKey="value"
                radius={[8, 8, 0, 0]}
            />
        </BarChart>
    );
}
export default NumberBarChart
