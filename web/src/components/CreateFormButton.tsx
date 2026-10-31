import {GoogleMaterialSymbol} from "./GoogleMaterialSymbol.tsx";
import {useNavigate} from "react-router-dom";
import type {HTTPResponse} from "../shared/types.ts";
import {useState} from "react";
import {API_BASE_URL} from "../shared/general.ts";

export const CreateFormButton = () => {
    const nav = useNavigate();
    const [isLoading, setLoading] = useState<boolean>(false);

    const createFormAndNavigate = () => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/forms`, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                title: "Untitled form"
            })
        }).then(r => {
            if (r.status == 200) {
                return r.json();
            }
            return null;
        }).then((resp: HTTPResponse<string> | null) => {
            setLoading(false);
            if (resp == null) {
                console.warn("failed to create form!");
                return;
            }
            nav(`form/${resp.data}/edit`);
        }).catch(e => {
            console.log(e);
            setLoading(false);
        })
    }

    return (
        <button
            className="secondary inline"
            onClick={createFormAndNavigate}
            disabled={isLoading}
        >
            <GoogleMaterialSymbol iconName={isLoading ? "progress_activity" : "add"} /> Create
        </button>
    );
}