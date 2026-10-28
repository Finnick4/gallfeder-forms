import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {type Form, NIL_UUID, type Question, type QuestionAnswer} from "../../shared/types.ts";
import {FormQuestion} from "../../components/questions/FormQuestion.tsx";
import type {FormGetResponse} from "../../shared/http_responses.ts";
import {QuestionTypes} from "../../shared/enums.ts";

// @ts-ignore
enum ResponseStatus {
    Respondable,
    Responded,
}

export const FormResponsePage = () => {
    const {formID} = useParams();

    const [form, setForm] = useState<Form>({
        id: NIL_UUID,
        title: "Loading...",
        description: "This is loading...",
        questions: []
    });

    const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
    const [status, setStatus] = useState<ResponseStatus>(ResponseStatus.Respondable);

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
                            id: NIL_UUID,
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
                            id: NIL_UUID,
                            title: "This form does not exist!",
                            description: "The form id is invalid.",
                            questions: []
                        }
                    };
                }

                return {
                    code: r.status,
                    data: {
                        id: NIL_UUID,
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
        }).then(() => {
            setStatus(ResponseStatus.Responded);
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
            meta: {
                selectedChoices: [],
                writtenText: ""
            }
        }
    }

    if (status == ResponseStatus.Responded) {
        return (
            <div className="page form response responed">
                <div className="section">
                    <h1>Thank you for responding!</h1>
                    <p>Thank you for taking your time and responding to this form.</p>
                    <button
                        onClick={() => {
                            setAnswers([]);
                            setStatus(ResponseStatus.Respondable);
                        }}
                        className="secondary"
                    >Submit a new response</button>
                </div>
            </div>
        );
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
                {form.questions ?
                    form.questions.map(q => <FormQuestion
                        question={q}
                        respondableSettings={{
                            currentAnswer: getCurrentAnswer(q),
                            answerChangeCallback: notifyAnswerChange
                        }}
                        editableSettings={undefined}
                        key={q.id}
                    />)
                    :
                    <FormQuestion
                        question={{
                            id: NIL_UUID,
                            formID: form.id,
                            type: QuestionTypes.InternalNotice,
                            index: 0,
                            meta: {
                                question: "There are no questions yet!"
                            }
                        }}
                        respondableSettings={undefined}
                        editableSettings={undefined}
                    />
                }
            </div>
            <div className="control section">
                <button className="submit primary" onClick={submit}>Submit</button>
            </div>
        </div>
    );
}
