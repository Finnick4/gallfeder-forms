import type {FormQuestionProperties} from "../../shared/properties.ts";
import type {ChoiceQuestionOption} from "../../shared/types.ts";
import {useState} from "react";

export const ChoiceQuestion = ({question, respondableSettings, editableSettings}: FormQuestionProperties) => {
    if (!question.meta.choiceOptions) {
        return (<h2>{question.meta.question}</h2>);
    }

    const [opts, setOptions] = useState<ChoiceQuestionOption[]>(structuredClone(question.meta.choiceOptions));

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
        if (previousOpt.text == changedOpt.text || editableSettings == undefined || question.meta.choiceOptions == undefined) {
            return;
        }

        const options = structuredClone(question.meta.choiceOptions);
        const index = options.findIndex(o => o.text == previousOpt.text);
        if (index == -1) {
            return;
        }
        options[index] = changedOpt;
        setOptions(options);
        question.meta.choiceOptions = options;
        editableSettings.questionEditedCallback(question);
    }

    return (
        <div className={isRespondable ? "question choice" : "question choice editable"}>
            <h2>{question.meta.question}</h2>
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
                                className="edit-label-text"
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
