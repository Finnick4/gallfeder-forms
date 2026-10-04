import FormsOverviewContextBar from "./FormsOverviewContextBar.tsx";
import {useEffect, useState} from "react";
import type {FormOverview, HTTPResponse} from "../../shared/types.ts";
import FormOverviewElement from "./FormOverviewElement.tsx";

const EditableFormsOverview = () => {
    const [formOverviews, setFormOverviews] = useState<FormOverview[]>([]);

    useEffect(() => {
        fetch(`http://localhost:8080/api/forms/editable`, {
            credentials: "include"
        })
            .then(r => r.json())
            .then((resp: HTTPResponse<FormOverview[]>) => {
                if (resp.code != 200) {
                    return;
                }
                setFormOverviews(resp.data);
            });
    }, []);

    return (
        <div className="section editable-forms-overview">
            <div className="head">
                <h2>Edit form</h2>
                <FormsOverviewContextBar></FormsOverviewContextBar>
            </div>

            <div className="form-overviews">
                {formOverviews.length == 0 ?
                    <p>You don't have any editable forms. Go ahead and create one!</p> :
                    formOverviews.map(fo => <FormOverviewElement form={fo} key={fo.id}></FormOverviewElement>)
                }

            </div>
        </div>

    );
}

export default EditableFormsOverview;