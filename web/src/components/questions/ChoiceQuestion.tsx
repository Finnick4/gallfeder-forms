import type {Question} from "../../shared/types.ts";

interface Properties {
    question: Question
}

export const ChoiceQuestion = ({question}: Properties) => {
    if (!question.meta.choiceOptions) {
        return (<h2>{question.meta.question}</h2>);
    }

    return (
        <div>
            <h2>{question.meta.question}</h2>
            {question.meta.choiceOptions.map((opt) => {
                return (
                    <label key={opt.text}>
                        <input type="radio" value={opt.text} name={question.id} />
                        {opt.text}
                    </label>
                );
            })}
        </div>
    );
}
