import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {type Form, type Question, type UUID} from "../../shared/types.ts";
import {FormQuestion} from "../../components/questions/FormQuestion.tsx";
import {getDifferencesBetweenForms} from "../../shared/form_difference.ts";
import FittingTextArea from "../../components/FittingTextArea.tsx";
import {isLoggedIn} from "../../shared/checks.ts";
import {FormEditPageHeader} from "../../components/header/FormEditPageHeader.tsx";

type FormVersions = {
    original: Form,
    changed: Form,
}

interface Properties {
    form: Form
}

export const FormEditPage = ({form}: Properties) => {
    const {formID} = useParams()
    const nav = useNavigate();

    useEffect(() => {
        if (!isLoggedIn()) {
            nav("/login")
        }
    }, []);

    const [formVers, setFormVersions] = useState<FormVersions>({
        original: structuredClone(form),
        changed: structuredClone(form)
    });
    const [currentlyFocussed, setFocussed] = useState<UUID>("");

    const titleEdit = useRef<HTMLInputElement>(null);
    const descriptionEdit = useRef<HTMLTextAreaElement>(null);

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
        <div>
            <FormEditPageHeader form={formVers.original} signalEditTitle={() => {
                titleEdit.current?.focus();
            }}></FormEditPageHeader>
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
                                console.log("now focussed: " + q.id);
                                setFocussed(q.id);
                            },
                        }}
                        respondableSettings={undefined}
                        key={q.id}/>)}
                </div>
                <div className="control section">
                    <button
                        className="save primary"
                        onClick={save}
                        onFocus={() => setFocussed("")}
                    >Save changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FormEditPage