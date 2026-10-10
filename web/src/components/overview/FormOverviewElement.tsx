import type {FormOverview} from "../../shared/types.ts";
import {AButton} from "../AButton.tsx";

interface Properties {
    form: FormOverview
}

const FormOverviewElement = ({form}: Properties) => {

    return (
        <AButton
            className="form-overview"
            href={`/form/${form.id}/edit`}
        >
            <div className="illustration"></div>
            <div className="data">
                <div className="title">{form.title}</div>
                <div className="stats">
                    <span className="questions">&#128505;{form.questions}</span>
                    <span className="responses">&#128499;{form.responses}</span>
                </div>
            </div>
        </AButton>
    );
}

export default FormOverviewElement;