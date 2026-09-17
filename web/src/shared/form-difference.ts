import {
    type Form,
    type FormEditChanges,
    type Question,
    type QuestionEditChanges,
} from "./types.ts";

export const getDifferencesBetweenForms = (old: Form, current: Form): FormEditChanges | undefined => {
    const questionEdits: QuestionEditChanges[] = [];

    for (const oldQuestion of old.questions) {
        let newVersion: Question | undefined = undefined;
        for (const newQuestion of current.questions) {
            if (newQuestion.id == oldQuestion.id) {
                newVersion = newQuestion;
                break;
            }
        }
        if (newVersion == undefined) {
            // The question was deleted.
            questionEdits.push({
                id: oldQuestion.id,
                deleteQuestion: true
            });
            continue;
        }
        const dif = getDifferenceBetweenQuestions(oldQuestion, newVersion);
        if (dif != undefined) {
            questionEdits.push(dif);
        }
    }

    for (const currentQuestion of current.questions) {
        let foundVersion: Question | undefined = undefined;
        for (const legacyQuestion of old.questions) {
            if (legacyQuestion.id == currentQuestion.id) {
                foundVersion = legacyQuestion;
                break;
            }
        }
        if (foundVersion == undefined) {
            // The question was created.
            questionEdits.push({
                id: "",
                index: currentQuestion.index,
                questionType: currentQuestion.type,
                overwriteMetadata: true,
                metadata: currentQuestion.meta
            });
            continue;
        }
    }

    let foundDifference = old.title != current.title || old.description != current.description || questionEdits.length != 0;

    return !foundDifference ? undefined : {
        title: old.title != current.title ? current.title : "",
        description: old.description != current.description ? current.description : "",
        removeDescription: old.description != current.description && current.description == "",
        questionChanges: questionEdits
    };
}

const getDifferenceBetweenQuestions = (q1: Question, q2: Question): QuestionEditChanges | undefined => {
    const dif: QuestionEditChanges = {
        id: q1.id
    }
    let foundDifference = false;

    if (q1.type != q2.type) {
        dif.questionType = q2.type;
        foundDifference = true;
    }
    if (q1.index != q2.index) {
        dif.index = q2.index;
        foundDifference = true;
    }
    if (JSON.stringify(q1.meta) != JSON.stringify(q2.meta)) {
        dif.metadata = structuredClone(q2.meta);
        dif.overwriteMetadata = true;
        foundDifference = true;
    }

    return foundDifference ? dif : undefined;
}
