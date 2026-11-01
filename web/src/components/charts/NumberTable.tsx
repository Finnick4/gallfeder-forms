import type {NumberChartAssignment} from "../../shared/properties.ts";
import {useState} from "react";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";
import type {AllowedGoogleMaterialSymbol} from "../../shared/types.ts";
import "./NumberTable.css";

interface Properties {
    assignments: NumberChartAssignment[]
}

// @ts-ignore
enum SortTypes {
    none,
    keyAsc,
    keyDesc,
    valueAsc,
    valueDesc,
}

export const NumberTable = ({assignments}: Properties ) => {
    const [sortType, setSortType] = useState<SortTypes>(SortTypes.none)

    const changeSortType = (clicked: SortTypes) => {
        if (sortType == clicked) {
            setSortType(sortType + 1);
            return
        }
        if (sortType == clicked + 1) {
            setSortType(SortTypes.none);
            return;
        }
        setSortType(clicked);
    }
    const determineIcon = (rootType: SortTypes): AllowedGoogleMaterialSymbol => {
        if (rootType == sortType) {
            return "arrow_downward";
        }
        if (rootType + 1 == sortType) {
            return "arrow_upward"
        }
        return "swap_vert";
    }
    const sort: (a: NumberChartAssignment, b: NumberChartAssignment) => number = (() => {
        switch (sortType) {
            case SortTypes.keyAsc:
                return (a: NumberChartAssignment, b: NumberChartAssignment): number => a.key.localeCompare(b.key);
            case SortTypes.keyDesc:
                return (a: NumberChartAssignment, b: NumberChartAssignment): number => b.key.localeCompare(a.key);
            case SortTypes.valueAsc:
                return (a: NumberChartAssignment, b: NumberChartAssignment): number => a.value - b.value;
            case SortTypes.valueDesc:
                return (a: NumberChartAssignment, b: NumberChartAssignment): number => b.value - a.value;
            default:
                return () => 0;
        }
    })()
    const sorted = sortType == SortTypes.none ? assignments : assignments.sort(sort);

    return (
        <div className="chart table">
            <div className="row head">
                <button onClick={() => changeSortType(SortTypes.keyAsc)} className="cell text">
                    Option <GoogleMaterialSymbol iconName={determineIcon(SortTypes.keyAsc)} />
                </button>
                <button onClick={() => changeSortType(SortTypes.valueAsc)} className="cell value">
                    Times Chosen <GoogleMaterialSymbol iconName={determineIcon(SortTypes.valueAsc)} />
                </button>
            </div>
            {sorted.map(a => {
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
