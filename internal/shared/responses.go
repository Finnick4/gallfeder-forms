package shared

import "uuid"

type Response struct {
	ID      uuid.UUID        `json:"responseID"`
	FormID  uuid.UUID        `json:"formID"`
	Answers []QuestionAnswer `json:"answers"`
}

type QuestionAnswer struct {
	QuestionID uuid.UUID              `json:"questionID"`
	Meta       QuestionAnswerMetadata `json:"meta"`
}

type QuestionAnswerMetadata struct {
	SelectedChoices []ChoiceQuestionOption `json:"selectedChoices"`
	WrittenText     string                 `json:"writtenText"`
}
