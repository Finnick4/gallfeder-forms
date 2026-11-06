import type {QuestionTypes} from "../shared/enums.ts";
import type {TypeSelectorEntry} from "../shared/types.ts";
import {GoogleMaterialSymbol} from "./GoogleMaterialSymbol.tsx";
import "./QuestionTypeSelector.css";
import {Button} from "./Button.tsx";


interface Properties {
    entries: TypeSelectorEntry<QuestionTypes>[] | ReadonlyArray<TypeSelectorEntry<QuestionTypes>>
    onClick?: (type: QuestionTypes) => void
}

export const QuestionTypeSelector = ({entries, onClick}: Properties) => {
    if (entries.length == 0) {
        return (<div className="question-type-selector">No entries parsed!</div>);
    }

    return (<div className="question-type-selector">
        {entries.map((e, i) => <Button
            styleType="secondary"
            key={i}
            className="entry"
            onClick={() => onClick ? onClick(e.storedType) : undefined}
        >
            <GoogleMaterialSymbol iconName={e.icon} /> {e.name}
        </Button>)}
    </div>);
}