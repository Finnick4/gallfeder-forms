import type {FormQuestionProperties} from "../../shared/properties.ts";
import type {ChoiceQuestionOption, Question} from "../../shared/types.ts";
import {useState} from "react";

export const ChoiceQuestion = ({question, respondableSettings, editableSettings}: FormQuestionProperties) => {
    const [q, setQuestion] = useState<Question>(structuredClone(question));

    const opts = q.meta.choiceOptions ? structuredClone(q.meta.choiceOptions) : [];

    const isRespondable = respondableSettings != undefined;

    const callUpdateWithOption = (opt: ChoiceQuestionOption) => {
        if (respondableSettings == undefined) {
            console.warn("Tried to change the answer of an irrespondable choice question.");
            return;
        }
        respondableSettings.currentAnswer.selectedChoices = [opt];
        respondableSettings.answerChangeCallback(respondableSettings.currentAnswer);
    }
    const isSelected = (opt: ChoiceQuestionOption) => {
        if (respondableSettings == undefined || respondableSettings.currentAnswer.selectedChoices == undefined) {
            return false;
        }

        return respondableSettings.currentAnswer.selectedChoices.filter(e => e.text == opt.text).length != 0;
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

    return (
        <div className={isRespondable ? "question choice" : "question choice editable"}>
            {isRespondable ?
                <h2>{q.meta.question}</h2> :
                <input
                    className="edit-question-text edit"
                    type="text"
                    defaultValue={q.meta.question}
                    onBlur={e => callEditOnQuestionText(q.meta.question, e.target.value)}
                ></input>}

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
                        {isRespondable ?
                            <span>{opt.text}</span> :
                            <input
                                className="edit-label-text edit"
                                type="text"
                                defaultValue={opt.text}
                                onBlur={e => callEditOnLabelText(opt, {text: e.target.value})}
                            ></input>}
                    </label>
                );
            })}
        </div>
    );
}
