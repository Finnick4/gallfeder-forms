import type {Form} from "../../shared/types.ts";
import { Button } from "../Button.tsx";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";
import "./FormEditPageHeader.css";

interface Properties {
    form: Form
    signalEditTitle: () => void
}

export const FormEditPageHeader = ({form, signalEditTitle}: Properties) => {
    return (
        <nav className="header-bar">
            <div className="left">
                <Button styleType="no-styling" className="back" href="/"><GoogleMaterialSymbol iconName={"arrow_back"} /></Button>
                <h3 onDoubleClick={signalEditTitle}>{form.title}</h3>
            </div>
            <div className="center panels">
                <Button styleType="no-styling" href={`/form/${form.id}/edit`}>Edit</Button>
                <Button styleType="no-styling" href={`/form/${form.id}/responses`}>Responses</Button>
            </div>
            <div className="right">

            </div>
        </nav>
    );
}