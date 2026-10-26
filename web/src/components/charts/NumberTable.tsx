import type {NumberChartAssignment} from "../../shared/properties.ts";

interface Properties {
    assignments: NumberChartAssignment[]
}

export const NumberTable = ({assignments}: Properties ) => {
    return (
        <div className="chart table">
            <div className="row head">
                <div className="cell text">Option</div>
                <div className="cell value">Times Chosen</div>
            </div>
            {assignments.map(a => {
                return (
                    <div className="row">
                        <div className="cell text">{a.key}</div>
                        <div className="cell value">{a.value}</div>
                    </div>
                );
            })}
        </div>
    );
}
