import type {FormQuestionProperties} from "../../shared/properties.ts";

export const InternalNoticeMockQuestion = ({question, editableSettings}: FormQuestionProperties) => {
    const focusElement = () => {
        editableSettings?.notifyFocus();
    }

    return (
        <div
            className="question mock internal-notice"
            onClick={focusElement}
        >
            <h2>{question.meta.question}</h2>

        </div>
    )
}
