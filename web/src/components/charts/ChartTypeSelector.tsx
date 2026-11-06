import {useEffect, useState} from "react";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";
import type {TypeSelectorEntry} from "../../shared/types.ts";
import "./ChartTypeSelector.css";
import {Button} from "../Button.tsx";

interface Properties<T> {
    entries: TypeSelectorEntry<T>[] | ReadonlyArray<TypeSelectorEntry<T>>
    defaultSelected?: T
    onChange?: (selected: T) => void
    identifier?: string
}

export const ChartTypeSelector = <T,>({entries, defaultSelected, onChange, identifier}: Properties<T>) => {
    const defaultState = defaultSelected ? entries.find(e => e.storedType == defaultSelected)! : entries[0];
    const [selected, setSelected] = useState<T>(defaultState.storedType);

    useEffect(() => {
        if (!identifier) {
            return;
        }
        const latestSelected = localStorage.getItem(identifier);
        if (!latestSelected) {
            return;
        }
        setSelected(Number(latestSelected) as T);
        if (onChange) {
            onChange(Number(latestSelected) as T);
        }
    }, [identifier])

    if (entries.length == 0) {
        return (<div className="chart-type-selector">No entries parsed!</div>);
    }

    const changeSelection = (entry: TypeSelectorEntry<T>) => {
        setSelected(entry.storedType);
        if (onChange) {
            onChange(entry.storedType);
        }
        if (identifier) {
            console.log(identifier)
            localStorage.setItem(identifier, entry.storedType as string);
        }
    }


    return (
        <div className="chart-type-selector">
            {entries.map((entry, index) => <Button
                key={index}
                className={`chart-selection-type ${selected == entry.storedType ? "selected" : ""}`}
                onClick={() => changeSelection(entry)}
                styleType="secondary"
                title={entry.name}
            >
                <GoogleMaterialSymbol iconName={entry.icon} filled={selected == entry.storedType} />
            </Button>)}
        </div>
    );
}