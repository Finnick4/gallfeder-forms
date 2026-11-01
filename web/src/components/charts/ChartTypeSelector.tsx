import {useState} from "react";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";
import type {TypeSelectorEntry} from "../../shared/types.ts";
import "./ChartTypeSelector.css";

interface Properties<T> {
    entries: TypeSelectorEntry<T>[] | ReadonlyArray<TypeSelectorEntry<T>>
    defaultSelected?: T
    onChange?: (selected: T) => void
}

export const ChartTypeSelector = <T,>({entries, defaultSelected, onChange}: Properties<T>) => {
    if (entries.length == 0) {
        return (<div className="chart-type-selector">No entries parsed!</div>);
    }
    const defaultState = defaultSelected ? entries.find(e => e.storedType == defaultSelected)! : entries[0];
    const [selected, setSelected] = useState<T>(defaultState.storedType);
    
    const changeSelection = (entry: TypeSelectorEntry<T>) => {
        setSelected(entry.storedType);
        if (onChange) {
            onChange(entry.storedType);
        }
    }

    return (
        <div className="chart-type-selector">
            {entries.map((entry, index) => <button
                key={index}
                className={`chart-selection-type ${selected == entry.storedType ? "selected" : ""}`}
                onClick={() => changeSelection(entry)}
                title={entry.name}
            >
                <GoogleMaterialSymbol iconName={entry.icon} filled={selected == entry.storedType} />
            </button>)}
        </div>
    );
}