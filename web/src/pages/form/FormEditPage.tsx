import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {type Form, NIL_UUID, type Question, type UUID} from "../../shared/types.ts";
import {FormQuestion} from "../../components/questions/FormQuestion.tsx";
import {getDifferencesBetweenForms} from "../../shared/form_difference.ts";
import FittingTextArea from "../../components/FittingTextArea.tsx";
import {isLoggedIn} from "../../shared/checks.ts";
import {QuestionTypes} from "../../shared/enums.ts";
import {GoogleMaterialSymbol} from "../../components/GoogleMaterialSymbol.tsx";
import {API_BASE_URL} from "../../shared/general.ts";
import "./form_pages.css";

type FormVersions = {
    original: Form,
    changed: Form,
}

interface Properties {
    form: Form
    updateForm?: (updated: Form) => void
}

export const FormEditPage = ({form, updateForm}: Properties) => {
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
    const [createdQuestions, setCreatedQuestions] = useState<number>(0);
    const [isTryingToSave, setTryingToSave] = useState<boolean>(false);

    const titleEdit = useRef<HTMLInputElement>(null);
    const descriptionEdit = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setFormVersions({
            original: structuredClone(form),
            changed: structuredClone(form)
        });
        if (titleEdit.current) {
            titleEdit.current.value = form.title;
        }
        if (descriptionEdit.current) {
            descriptionEdit.current.value = form.description.replaceAll("\\n", "\n");
        }
    }, [form])


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
            return structuredClone(prev);
        });
    }

    const editTitleInput = (obj: HTMLInputElement) => {
        if (obj.value.length >= 64 || obj.value.length == 0) {
            obj.classList.add("has-issue");
        } else {
            obj.classList.remove("has-issue");
        }
    }

    const addQuestion = (qt: QuestionTypes) => {
        const q = {
            formID: formVers.changed.id,
            id: `created-${createdQuestions}`,
            index: 0,
            type: qt,
            meta: {
                question: ""
            }
        };
        setFormVersions((prev) => {
            if (prev.changed.questions == null) {
                prev.changed.questions = [q];
                return prev;
            }
            if (prev.changed.questions.findIndex(quest => quest.id == q.id) != -1) {
                return prev;
            }
            prev.changed.questions.push(q);
            return prev;
        });
        setFocussed(q.id);
        setCreatedQuestions(createdQuestions + 1);
    }

    const save = () => {
        if (formVers.changed.title.length >= 64 || formVers.changed.title.length == 0) {
            console.log("Did not initialise saving anything as the current title is invalid!");
            return;
        }
        setTryingToSave(true);
        const differences = getDifferencesBetweenForms(formVers.original, formVers.changed);
        if (differences == undefined) {
            setTryingToSave(false);
            return;
        }
        const old = structuredClone(formVers.original);
        const changed = structuredClone(formVers.changed);

        fetch(`${API_BASE_URL}/api/forms/${formVers.original.id}`, {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify(differences)
        }).then(r => {
            setTryingToSave(false);
            if (r.status == 200) {
                setFormVersions({original: structuredClone(changed), changed: structuredClone(changed)});
                if (updateForm) {
                    updateForm(changed);
                }
                console.log("Saved successfully!");
                return;
            }
            console.error("Failed to save: " + r.status);
            setFormVersions({original: structuredClone(old), changed: structuredClone(old)});
            return;
        }).catch(reason => {
            console.error("Failed to save: " + reason);
            setTryingToSave(false);
            setFormVersions({original: structuredClone(old), changed: structuredClone(old)});
            return;
        });
    }

    return (
        <div>
            <div className="page form edit">
                <div className="form-response-head section">
                    <input
                        type="text"
                        className="usable edit-title"
                        defaultValue={formVers.changed.title}
                        ref={titleEdit}
                        onFocus={() => setFocussed("")}
                        onChange={e => editTitleInput(e.target)}
                        onBlur={e => editTitle(e.target.value)}
                    />
                    <FittingTextArea
                        className="description"
                        ref={descriptionEdit}
                        onFocus={() => setFocussed("")}
                        initialValue={formVers.changed.description}
                        onLeave={editDescription}
                    />
                </div>
                <div className="questions section">
                    {formVers.changed.questions ?
                        formVers.changed.questions.map(q => <FormQuestion
                            question={structuredClone(q)}
                            editableSettings={{
                                questionEditedCallback: notifyQuestionEdit,
                                currentlyFocussed: currentlyFocussed,
                                notifyFocus: () => {
                                    setFocussed(q.id);
                                },
                            }}
                            respondableSettings={undefined}
                            addQuestionCallback={addQuestion}
                            key={q.id}
                        />)
                        :
                        <FormQuestion
                            question={{
                                id: NIL_UUID,
                                formID: formVers.original.id,
                                type: QuestionTypes.InternalNotice,
                                index: 0,
                                meta: {
                                    question: "There are no questions!"
                                }
                            }}
                            respondableSettings={undefined}
                            addQuestionCallback={addQuestion}
                            forceAddQuestionSection
                            editableSettings={undefined}
                        />
                    }
                </div>
                <div className="control section">
                    <button
                        className="save primary"
                        onClick={save}
                        disabled={isTryingToSave}
                        onFocus={() => setFocussed("")}
                    ><GoogleMaterialSymbol iconName={isTryingToSave ? "progress_activity" : "save"} /> Save changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FormEditPage