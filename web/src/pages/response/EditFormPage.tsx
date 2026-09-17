import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Form, Question} from "../../shared/types.ts";
import {FormQuestion} from "../../components/questions/FormQuestion.tsx";
import type {FormGetResponse} from "../../shared/http_responses.ts";
import {getDifferencesBetweenForms} from "../../shared/form-difference.ts";

type FormVersions = {
    original: Form,
    changed: Form,
}

export const EditFormPage = () => {
    const {formID} = useParams()

    const [formVers, setFormVersions] = useState<FormVersions>({
        original: {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Loading...",
            description: "This is loading...",
            questions: []
        },
        changed: {
            id: "00000000-0000-0000-0000-000000000000",
            title: "Loading...",
            description: "This is loading...",
            questions: []
        }
    });

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
                setFormVersions({
                    original: structuredClone(resp.data),
                    changed: structuredClone(resp.data)
                });
            });
    }, []);

    const notifyQuestionEdit =  (question: Question) => {
        setFormVersions((prev) => {
            console.log(prev)
            const index = prev.changed.questions.findIndex(q => q.id == question.id);
            if (index == -1) {
                prev.changed.questions.push(question);
                return prev;
            }
            prev.changed.questions[index] = question;
            console.log(prev)
            return prev;
        });
    }


    const save = () => {
        const differences = getDifferencesBetweenForms(formVers.original, formVers.changed);
        if (differences != undefined) {
            const old = structuredClone(formVers.original);
            const changed = structuredClone(formVers.changed);

            fetch(`http://localhost:8080/api/forms/${formID}`, {
                method: "PATCH",
                body: JSON.stringify(differences)
            }).then(r => {
                if (r.status == 200) {
                    setFormVersions({original: structuredClone(changed), changed: structuredClone(changed)});
                    console.log("Saved successfully!");
                    return;
                }
                console.log("Failed to save: " + r.status);
                setFormVersions({original: structuredClone(old), changed: structuredClone(old)});
                return;
            }).catch(reason => {
                console.log("Failed to save: " + reason);
                setFormVersions({original: structuredClone(old), changed: structuredClone(old)});
                return;
            });
        }
    }

    return (
        <div className="page form response">
            <div className="form-response-head section">
                <h1>{formVers.changed.title}</h1>
                <p>{formVers.changed.description}</p>
            </div>
            <div className="questions section">
                {formVers.changed.questions.map(q => <FormQuestion
                    question={structuredClone(q)}
                    editableSettings={{
                        questionEditedCallback: notifyQuestionEdit
                    }}
                    respondableSettings={undefined}
                    key={q.id}
                />)}
            </div>
            <div className="control section">
                <button className="save primary" onClick={save}>Save changes</button>
            </div>
        </div>
    );
}

export default EditFormPage