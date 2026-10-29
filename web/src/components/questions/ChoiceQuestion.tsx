import type {FormQuestionProperties} from "../../shared/properties.ts";
import {type ChoiceQuestionOption, type Question} from "../../shared/types.ts";
import {useEffect, useRef, useState} from "react";
import {GoogleMaterialSymbol} from "../GoogleMaterialSymbol.tsx";

export const ChoiceQuestion = ({question, respondableSettings, editableSettings}: FormQuestionProperties) => {
    const [q, setQuestion] = useState<Question>(structuredClone(question));
    const elem = useRef<HTMLDivElement>(null);
    const qInputElem = useRef<HTMLInputElement>(null);

    const isRespondable = respondableSettings != undefined;
    const isFocussed = editableSettings?.currentlyFocussed == q.id;
    const showAddPrompt = q.meta.choiceOptions == undefined || q.meta.choiceOptions.findIndex(opt => opt.text == "") == -1;

    useEffect(() => {
        if (isFocussed) {
            qInputElem.current?.focus();
        }
    }, [isFocussed]);

    const opts = q.meta.choiceOptions ? structuredClone(q.meta.choiceOptions) : [];

    const addOption = () => {
        setQuestion((prev) => {
            if (prev.meta.choiceOptions == null) {
                prev.meta.choiceOptions = [{text: ""}];
                return prev;
            }
            if (prev.meta.choiceOptions.findIndex(opt => opt.text == "") != -1) {
                return prev;
            }
            prev.meta.choiceOptions.push({text: ""});
            return structuredClone(prev);
        });
    }

    const callUpdateWithOption = (opt: ChoiceQuestionOption) => {
        if (respondableSettings == undefined) {
            console.warn("Tried to change the answer of an irrespondable choice question.");
            return;
        }
        respondableSettings.currentAnswer.meta.selectedChoices = [opt];
        respondableSettings.answerChangeCallback(respondableSettings.currentAnswer);
    }
    const isSelected = (opt: ChoiceQuestionOption) => {
        if (respondableSettings == undefined || respondableSettings.currentAnswer.meta.selectedChoices == undefined) {
            return false;
        }

        return respondableSettings.currentAnswer.meta.selectedChoices.filter(e => e.text == opt.text).length != 0;
    }

    const callEditOnLabelText = (previousOpt: ChoiceQuestionOption, changedOpt: ChoiceQuestionOption) => {
        if (previousOpt.text == changedOpt.text || editableSettings == undefined) {
            return;
        }

        const index = opts.findIndex(o => o.text == previousOpt.text);
        if (index == -1) {
            return;
        }
        opts[index] = changedOpt;
        setQuestion(prevState => {
            prevState.meta.choiceOptions = opts;
            editableSettings.questionEditedCallback(prevState);
            return prevState;
        });
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


    if (isRespondable || !isFocussed) {
        return (
            <div
                className="question choice"
                ref={elem}
                onClick={focusElement}
            >
                <h2>{q.meta.question == "" ? "Unset question" : q.meta.question}</h2>
                {opts.map((opt: ChoiceQuestionOption) => {
                    return (
                        <label key={opt.text}>
                            <input type="radio"
                                   value={opt.text}
                                   name={question.id}
                                   defaultChecked={isSelected(opt)}
                                   disabled={!isRespondable}
                                   onChange={() => callUpdateWithOption(opt)}
                            />
                            <span>{opt.text}</span>
                        </label>
                    );
                })}
            </div>
        );
    }

    return (
        <div
            className="question choice editable"
            ref={elem}
        >
            <input
                className="edit-question-text usable"
                type="text"
                defaultValue={q.meta.question}
                ref={qInputElem}
                onBlur={e => callEditOnQuestionText(q.meta.question, e.target.value)}
            ></input>

            {opts.map((opt: ChoiceQuestionOption) => {
                return (
                    <label key={opt.text}>
                        <input type="radio"
                               value={opt.text}
                               name={question.id}
                               defaultChecked={isSelected(opt)}
                               disabled={true}
                               onChange={() => callUpdateWithOption(opt)}
                        />
                        <input
                            className="edit-label-text usable"
                            type="text"
                            defaultValue={opt.text}
                            onBlur={e => callEditOnLabelText(opt, {text: e.target.value})}
                        ></input>
                    </label>
                );
            })}
            {
                showAddPrompt ?
                <button
                    className="option"
                    onClick={addOption}
                >
                    <GoogleMaterialSymbol iconName="add" />
                    <div className="edit-label-text">Add option</div>
                </button> : <></>
            }
        </div>
    );
}
