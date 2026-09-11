import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Form} from "../../shared/types.ts";
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

    useEffect(() => {
        fetch(`http://localhost:8080/api/forms/${formID}`)
            .then(r => r.json())
            .then((resp: FormGetResponse) => {
                setForm(resp.data);
            });
        // @TODO: handle invalid id => 404
    }, []);


    return (
        <div>
            <div className="form-response-head">
                <h1>{form.title}</h1>
                <p>{form.description}</p>
            </div>
            <div className="questions">
                {form.questions.map(q => <FormQuestion question={q} key={q.id} />)}
            </div>
        </div>
    );
}

export default ResponsePage