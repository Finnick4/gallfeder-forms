import {useState} from "react";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";
import type {ChartTypeSelectorEntry} from "../../shared/types.ts";

interface Properties<T> {
    entries: ChartTypeSelectorEntry<T>[]
    defaultSelected?: T
    onChange?: (selected: T) => void
}

export const ChartTypeSelector = <T,>({entries, defaultSelected, onChange}: Properties<T>) => {
    if (entries.length == 0) {
        return (<div className="chart-type-selector">No entries parsed!</div>);
    }
    const defaultState = defaultSelected ? entries.find(e => e.chartType == defaultSelected)! : entries[0];
    const [selected, setSelected] = useState<T>(defaultState.chartType);
    
    const changeSelection = (entry: ChartTypeSelectorEntry<T>) => {
        setSelected(entry.chartType);
        if (onChange) {
            onChange(entry.chartType);
        }
    }

    return (
        <div className="chart-type-selector">
            {entries.map(entry => <button 
                className={`chart-selection-type ${selected == entry.chartType ? "selected" : ""}`}
                onClick={() => changeSelection(entry)}
                title={entry.name}
            >
                <GoogleMaterialSymbol iconName={entry.icon} filled={selected == entry.chartType} />
            </button>)}
        </div>
    );
}