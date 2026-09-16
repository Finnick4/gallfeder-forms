import type {FormQuestionProperties} from "../../shared/properties.ts";
import type {ChoiceQuestionOption} from "../../shared/types.ts";

export const ChoiceQuestion = ({question, respondableSettings}: FormQuestionProperties) => {
    if (!question.meta.choiceOptions) {
        return (<h2>{question.meta.question}</h2>);
    }

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

    return (
        <div className="question choice">
            <h2>{question.meta.question}</h2>
            {question.meta.choiceOptions.map((opt: ChoiceQuestionOption) => {
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
