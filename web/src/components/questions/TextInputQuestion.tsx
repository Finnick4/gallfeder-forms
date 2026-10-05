import type {FormQuestionProperties} from "../../shared/properties.ts";
import {type Question} from "../../shared/types.ts";
import {useRef, useState} from "react";

export const TextInputQuestion = ({question, respondableSettings, editableSettings}: FormQuestionProperties) => {
    const [q, setQuestion] = useState<Question>(structuredClone(question));
    const inputElem = useRef<HTMLInputElement>(null)

    const isRespondable = respondableSettings != undefined;
    const isFocussed = editableSettings?.currentlyFocussed == q.id;

    const callUpdate = () => {
        console.log("Update!!!")
        if (respondableSettings == undefined || inputElem.current == null) {
            console.warn("Tried to change the answer of an irrespondable choice question.");
            return;
        }
        respondableSettings.currentAnswer.writtenText = inputElem.current.value;
        respondableSettings.answerChangeCallback(respondableSettings.currentAnswer);
    }

    const callEditOnQuestionText = (original: string, changed: string) => {
        if (original == changed || editableSettings == undefined) {
            return;
        }
        setQuestion(prevState => {
            prevState.meta.question = changed;
            editableSettings.questionEditedCallback(prevState);
            return prevState;
        });
    }

    const focusElement = () => {
        if (!isFocussed) {
            editableSettings?.notifyFocus();
        }
    }

    // TODO: Add call down from EditFormPage to notify a different element has been focussed / call callEditOnQuestionText when loss of focus because other question is edited

    if (isRespondable || !isFocussed) {
        return (
            <div
                className="question text-input"
                onClick={focusElement}
            >
                <h2>{q.meta.question}</h2>
                <input type="text"
                       ref={inputElem}
                       disabled={!isRespondable}
                       onChange={callUpdate}
                />
            </div>
        );
    }

    return (
        <div
            className="question choice editable"
        >
            <input
                className="edit-question-text usable"
                type="text"
                defaultValue={q.meta.question}
                onBlur={e => callEditOnQuestionText(q.meta.question, e.target.value)}
            ></input>

            <input type="text"
                   ref={inputElem}
                   disabled={true}
            />
        </div>
    );
}
