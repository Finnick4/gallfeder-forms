import type {FormOverview} from "../../shared/types.ts";
import {AButton} from "../AButton.tsx";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";
import "./FormOverviewElement.css";

interface Properties {
    form: FormOverview
}

export const FormOverviewElement = ({form}: Properties) => {

    return (
        <AButton
            className="form-overview"
            href={`/form/${form.id}/edit`}
        >
            <div className="illustration"></div>
            <div className="data">
                <div className="title">{form.title}</div>
                <div className="stats">
                    <span className="questions"><GoogleMaterialSymbol iconName={"question_mark"} /> {form.questions}</span>
                    <span className="responses"><GoogleMaterialSymbol iconName={"how_to_vote"} /> {form.responses}</span>
                </div>
            </div>
        </AButton>
    );
}
