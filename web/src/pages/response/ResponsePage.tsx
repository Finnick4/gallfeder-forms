import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Form, Question, QuestionAnswer} from "../../shared/types.ts";
import {FormQuestion} from "../../components/questions/FormQuestion.tsx";
import type {FormGetResponse} from "../../shared/http_responses.ts";

export const ResponsePage = () => {
    const {formID} = useParams()

    const [form, setForm] = useState<Form>({
        id: "00000000-0000-0000-0000-000000000000",
        title: "Loading...",
        description: "This is loading...",
        questions: []
    });

    const [answers, setAnswers] = useState<QuestionAnswer[]>([])

    const notifyAnswerChange =  (answer: QuestionAnswer) => {
        setAnswers((prevState) => {
            const index = prevState.findIndex(a => a.questionID == answer.questionID);
            if (index == -1) {
                prevState.push(answer);
                return prevState;
            }
            prevState[index] = answer;
            return prevState;
        });
    }

    useEffect(() => {
        fetch(`http://localhost:8080/api/forms/${formID}`)
            .then(r => r.json())
            .then((resp: FormGetResponse) => {
                setForm(resp.data);
            });
        // @TODO: handle invalid id => 404
    }, []);

    const submit = () => {
        fetch(`http://localhost:8080/api/forms/${formID}/responses`, {
            method: "POST",
            body: JSON.stringify({
                answers: answers
            })
        });
    }


    const getCurrentAnswer = (q: Question): QuestionAnswer => {
        const answer = answers.find(a => a.questionID == q.id);
        if (answer != undefined) {
            return answer;
        }
        return {
            questionID: q.id,
            type: q.type,
            selectedChoices: [],
        }
    }

    return (
        <div>
            <div className="form-response-head">
                <h1>{form.title}</h1>
                <p>{form.description}</p>
            </div>
            <div className="questions">
                {form.questions.map(q => <FormQuestion question={q} currentAnswer={getCurrentAnswer(q)} answerChangeCallback={notifyAnswerChange} key={q.id} />)}
            </div>
            <div className="control">
                <button className="submit" onClick={submit}>Submit</button>
            </div>
        </div>
    );
}

export default ResponsePage