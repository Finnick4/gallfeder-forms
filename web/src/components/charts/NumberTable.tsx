import type {NumberChartAssignment} from "../../shared/properties.ts";

interface Properties {
    assignments: NumberChartAssignment[]
}

export const NumberTable = ({assignments}: Properties ) => {
    return (
        <div className="chart table">
            {assignments.map(a => {
                return (
                    <div className="row">
                        <div className="text">{a.key}</div>
                        <div className="value">{a.value}</div>
                    </div>
                );
            })}
        </div>
    );
}
