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
            .then(r => {
                if (r.ok) {
                    return r.json();
                }
                if (r.status == 404) {
                    console.log("The provided form does not exist!");
                    return {
                        code: 404,
                        data: {
                            id: "00000000-0000-0000-0000-000000000000",
                            title: "This form does not exist!",
                            description: "The form you are trying to view does not exist.",
                            questions: []
                        }
                    }
                }
                if (r.status == 400) {
                    console.log("The provided form id is invalid!");
                    return {
                        code: 400,
                        data: {
                            id: "00000000-0000-0000-0000-000000000000",
                            title: "This form does not exist!",
                            description: "The form id is invalid.",
                            questions: []
                        }
                    };
                }

                return {
                    code: r.status,
                    data: {
                        id: "00000000-0000-0000-0000-000000000000",
                        title: "There was an issue getting the form!",
                        description: `As such, the form cannot be responded to. Code: ${r.status}`,
                        questions: []
                    }
                }
            })
            .then((resp: FormGetResponse) => {
                setForm(resp.data);
            });
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
        <div className="page form response">
            <div className="form-response-head section">
                <h1>{form.title}</h1>
                <div className="description">
                    {form.description.split("\\n").map(line => <p className="line">{line}</p>)}
                </div>
            </div>
            <div className="questions section">
                {form.questions.map(q => <FormQuestion
                    question={q}
                    respondableSettings={{
                        currentAnswer: getCurrentAnswer(q),
                        answerChangeCallback: notifyAnswerChange
                    }}
                    editableSettings={undefined}
                    key={q.id} />)}
            </div>
            <div className="control section">
                <button className="submit primary" onClick={submit}>Submit</button>
            </div>
        </div>
    );
}

export default ResponsePage