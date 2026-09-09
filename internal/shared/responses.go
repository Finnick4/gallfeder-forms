package shared

import "uuid"

type Response struct {
	ID      uuid.UUID
	FormID  uuid.UUID
	Answers []QuestionAnswer
}

type QuestionAnswer struct {
	QuestionID uuid.UUID
	Meta       QuestionAnswerMetadata
}

type QuestionAnswerMetadata struct {
}
