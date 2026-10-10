import type {Form} from "../../shared/types.ts";
import {AButton} from "../AButton.tsx";

interface Properties {
    form: Form
    signalEditTitle: () => void
}

export const FormEditPageHeader = ({form, signalEditTitle}: Properties) => {
    return (
        <nav className="header-bar">
            <AButton className="back" href="/">⬅</AButton>
            <h3 onDoubleClick={signalEditTitle}>{form.title}</h3>
        </nav>
    );
}