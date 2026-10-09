import type {Form} from "../../shared/types.ts";

interface Properties {
    form: Form
    signalEditTitle: () => void
}

export const FormEditPageHeader = ({form, signalEditTitle}: Properties) => {
    return (
        <nav className="header-bar">
            <a className="back button" href="/">⬅</a>
            <h3 onDoubleClick={signalEditTitle}>{form.title}</h3>
        </nav>
    );
}