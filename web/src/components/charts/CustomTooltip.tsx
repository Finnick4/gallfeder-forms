import type {TooltipContentProps} from "recharts";

export const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
    const firstPayload = payload?.[0];
    const isVisible = active && firstPayload != null;
    const name = label ? label : firstPayload?.name;
    return (
        <div className="chart-tooltip">
            {isVisible && (
                <div className="label">{`${name}: ${firstPayload.value}`}</div>
            )}
        </div>
    );
};
