import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Form} from "../../shared/types.ts";
import {FormQuestion} from "../../components/questions/FormQuestion.tsx";
import type {FormGetResponse} from "../../shared/http_responses.ts";

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
                    original: resp.data,
                    changed: resp.data
                });
            });
    }, []);


    const save = () => {
        console.log("saving!");
        /*fetch(`http://localhost:8080/api/forms/${formID}/responses`, {
            method: "POST",
            body: JSON.stringify({
                answers: answers
            })
        });*/
    }

    return (
        <div className="page form response">
            <div className="form-response-head section">
                <h1>{formVers.changed.title}</h1>
                <p>{formVers.changed.description}</p>
            </div>
            <div className="questions section">
                {formVers.changed.questions.map(q => <FormQuestion
                    question={q}
                    editableSettings={undefined}
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