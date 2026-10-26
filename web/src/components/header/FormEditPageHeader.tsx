import type {Form} from "../../shared/types.ts";
import {AButton} from "../AButton.tsx";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";

interface Properties {
    form: Form
    signalEditTitle: () => void
}

export const FormEditPageHeader = ({form, signalEditTitle}: Properties) => {
    return (
        <nav className="header-bar">
            <div className="left">
                <AButton className="back" href="/"><GoogleMaterialSymbol iconName={"arrow_back"} /></AButton>
                <h3 onDoubleClick={signalEditTitle}>{form.title}</h3>
            </div>
            <div className="center panels">
                <AButton href={`/form/${form.id}/edit`}>Edit</AButton>
                <AButton href={`/form/${form.id}/responses`}>Responses</AButton>
            </div>
            <div className="right">

            </div>
        </nav>
    );
}