import type {FormQuestionProperties} from "../../shared/properties.ts";
import type {ChoiceQuestionOption} from "../../shared/types.ts";

export const ChoiceQuestion = ({question, currentAnswer, answerChangeCallback}: FormQuestionProperties) => {
    if (!question.meta.choiceOptions) {
        return (<h2>{question.meta.question}</h2>);
    }
    const callUpdateWithOption = (opt: ChoiceQuestionOption) => {
        currentAnswer.selectedChoices = [opt];
        answerChangeCallback(currentAnswer);
    }
    const isSelected = (opt: ChoiceQuestionOption) => {
        if (currentAnswer.selectedChoices == undefined) {
            return false
        }

        return currentAnswer.selectedChoices.filter(e => e.text == opt.text).length != 0;
    }

    return (
        <div className="question choice">
            <h2>{question.meta.question}</h2>
            {question.meta.choiceOptions.map((opt: ChoiceQuestionOption) => {
                return (
                    <label key={opt.text}>
                        <input type="radio" value={opt.text} name={question.id} defaultChecked={isSelected(opt)} onChange={() => callUpdateWithOption(opt)} />
                        <span>{opt.text}</span>
                    </label>
                );
            })}
        </div>
    );
}
