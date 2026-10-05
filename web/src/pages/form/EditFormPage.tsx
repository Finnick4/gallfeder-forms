import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import type {Form, Question, UUID} from "../../shared/types.ts";
import {FormQuestion} from "../../components/questions/FormQuestion.tsx";
import type {FormGetResponse} from "../../shared/http_responses.ts";
import {getDifferencesBetweenForms} from "../../shared/form_difference.ts";
import FittingTextArea from "../../components/FittingTextArea.tsx";
import {isLoggedIn} from "../../shared/checks.ts";

type FormVersions = {
    original: Form,
    changed: Form,
}

export const EditFormPage = () => {
    const {formID} = useParams()
    const nav = useNavigate();

    useEffect(() => {
        if (!isLoggedIn()) {
            nav("/login")
        }
    }, []);

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
    const [currentlyFocussed, setFocussed] = useState<UUID>("");

    const titleEdit = useRef<HTMLInputElement>(null);
    const descriptionEdit = useRef<HTMLTextAreaElement>(null);

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
                if (titleEdit.current != null) {
                    titleEdit.current.value = resp.data.title;
                }
                if (descriptionEdit.current != null) {
                    descriptionEdit.current.value = resp.data.description.replaceAll("\\n", "\n");
                }
            });
    }, []);

    const notifyQuestionEdit =  (question: Question) => {
        setFormVersions((prev) => {
            const index = prev.changed.questions.findIndex(q => q.id == question.id);
            if (index == -1) {
                prev.changed.questions.push(question);
                return prev;
            }
            prev.changed.questions[index] = question;
            return prev;
        });

    }
    const editTitle = (updatedTitle: string) => {
        setFormVersions(prev => {
            prev.changed.title = updatedTitle;
            return prev;
        });
    }

    const editDescription = (updatedDescription: string) => {
        setFormVersions(prev => {
            prev.changed.description = updatedDescription;
            return prev;
        });
    }

    const editTitleInput = (obj: HTMLInputElement) => {
        if (obj.value.length >= 64 || obj.value.length == 0) {
            obj.classList.add("has-issue");
        } else {
            obj.classList.remove("has-issue");
        }
    }

    const save = () => {
        if (formVers.changed.title.length >= 64 || formVers.changed.title.length == 0) {
            console.log("Did not initialise saving anything as the currrent title is invalid!");
            return;
        }
        const differences = getDifferencesBetweenForms(formVers.original, formVers.changed);
        if (differences == undefined) {
            return;
        }
        const old = structuredClone(formVers.original);
        const changed = structuredClone(formVers.changed);

        fetch(`http://localhost:8080/api/forms/${formID}`, {
            method: "PATCH",
            credentials: "include",
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

    return (
        <div className="page form edit">
            <div className="form-response-head section">
                <input
                    type="text"
                    className="usable edit-title"
                    defaultValue={formVers.changed.title}
                    ref={titleEdit}
                    onFocus={() => setFocussed("")}
                    onChange={e => editTitleInput(e.target)}
                    onBlur={e => editTitle(e.target.value)}></input>
                <FittingTextArea
                    className="description"
                    ref={descriptionEdit}
                    onFocus={() => setFocussed("")}
                    initialValue={formVers.changed.description}
                    onLeave={editDescription}></FittingTextArea>
            </div>
            <div className="questions section">
                {formVers.changed.questions.map(q => <FormQuestion
                    question={structuredClone(q)}
                    editableSettings={{
                        questionEditedCallback: notifyQuestionEdit,
                        currentlyFocussed: currentlyFocussed,
                        notifyFocus: () => {
                            console.log("now focussed: "+ q.id)
                            setFocussed(q.id);
                        },
                    }}
                    respondableSettings={undefined}
                    key={q.id}
                />)}
            </div>
            <div className="control section">
                <button
                    className="save primary"
                    onClick={save}
                    onFocus={() => setFocussed("")}
                >Save changes</button>
            </div>
        </div>
    );
}

export default EditFormPage