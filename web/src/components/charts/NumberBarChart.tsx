import type {NumberChartAssignment} from "../../shared/properties.ts";
import {Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis} from "recharts";

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
            //margins?
        >
            <CartesianGrid />
            <XAxis dataKey="key" />
            <YAxis width="auto" allowDecimals={false} />
            <Tooltip />
            <Bar
                fill="var(--primary)"
                stroke="var(--primary-border-color)"
                strokeWidth="var(--border-width)"
                dataKey="value"
            />
        </BarChart>
    );
}
export default NumberBarChart
