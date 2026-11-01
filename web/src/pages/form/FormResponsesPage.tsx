import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {
    type FormResponses,
    type HTTPResponse,
    NIL_UUID
} from "../../shared/types.ts";
import {isLoggedIn} from "../../shared/checks.ts";
import {FormQuestionResponses} from "../../components/questions/responses/FormQuestionResponses.tsx";
import {API_BASE_URL} from "../../shared/general.ts";
import "./form_pages.css";


export const FormResponsesPage = () => {
    const {formID} = useParams()
    const nav = useNavigate();

    useEffect(() => {
        if (!isLoggedIn()) {
            nav("/login")
        }
    }, []);

    const [formResponses, setFormResponses] = useState<FormResponses>({
        id: NIL_UUID,
        title: "Loading form",
        description: "This form and the responses to it are currently loading. Please be patient.",
        questionResponses: [],
        totalResponses: 0
    });

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/forms/${formID}/responses`, {
            method: "GET",
            credentials: "include",
        }).then(r => {
                if (r.ok) {
                    return r.json();
                }
                console.error(r)
                if (r.status == 404) {
                    console.log("The provided form does not exist!");
                    return {
                        code: 404,
                        data: {
                            id: NIL_UUID,
                            title: "Form doesn't exist",
                            description: "This form does not exist.",
                            questionResponses: [],
                            totalResponses: 0
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
                            questionResponses: [],
                            totalResponses: 0
                        }
                    };
                }

                return {
                    code: r.status,
                    data: {
                        id: NIL_UUID,
                        title: "There was an issue getting the form!",
                        description: `As such, the form cannot be responded to. Code: ${r.status}`,
                        questionResponses: [],
                        totalResponses: 0
                    }
                }
            })
            .then((resp: HTTPResponse<FormResponses>) => {
                setFormResponses(resp.data);
            });
    }, []);

    return (
        <div className="page form responses">
            <div className="form-response-head section">
                <h1>{formResponses.title}</h1>
                <div className="data">
                    <div className="stat">Responses: {formResponses.totalResponses}</div>
                </div>
            </div>
            <div className="questions section">
                {formResponses.questionResponses.map(q => <FormQuestionResponses
                    question={structuredClone(q)}
                    key={q.questionID}/>)}
            </div>

        </div>
    );
}

export default FormResponsesPage