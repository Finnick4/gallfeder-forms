import {useEffect, useState} from "react";
import FormEditPage from "./FormEditPage.tsx";
import FormResponsesPage from "./FormResponsesPage.tsx";
import {FormEditPageHeader} from "../../components/header/FormEditPageHeader.tsx";
import {type Form, FormModifySubpages, type HTTPResponse, NIL_UUID} from "../../shared/types.ts";
import {useParams} from "react-router-dom";


interface Properties {
    subpage: FormModifySubpages
}

export const FormModifyPages = ({subpage}: Properties) => {
    const {formID} = useParams()
    const [form, setForm] = useState<Form>({
        id: NIL_UUID,
        title: "Loading...",
        description: "This is loading...",
        questions: []
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
            .then((resp: HTTPResponse<Form>) => {
                setForm(structuredClone(resp.data));
            });
    }, []);

    const getPage = () => {
        switch (subpage) {
            case FormModifySubpages.Edit: return (<FormEditPage form={form}></FormEditPage>);
            case FormModifySubpages.Responses: return (<FormResponsesPage></FormResponsesPage>);
        }
    };

    return (
        <div>
            <FormEditPageHeader form={form} signalEditTitle={() => {}}></FormEditPageHeader>
            {getPage()}
        </div>
    );

}