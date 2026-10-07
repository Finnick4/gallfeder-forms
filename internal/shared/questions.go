package shared

import "uuid"

type QuestionType int

const (
	QuestionTypeInvalid QuestionType = iota
	QuestionTypeChoice
	QuestionTypeString
)

type QuestionMetaData struct {
	Question       string                 `json:"question"`
	ChoiceOptions  []ChoiceQuestionOption `json:"choiceOptions"`
	MaximumChoices int                    `json:"maximumChoices"`
}

type QuestionResponseMetaData struct {
	Question              string                          `json:"question"`
	ChoiceOptionsResponse []ChoiceQuestionOptionResponses `json:"choiceOptionsResponse"`
	MaximumChoices        int                             `json:"maximumChoices"`
	SubmittedTexts        []string                        `json:"submittedTexts"`
	Responses             int                             `json:"responses"`
	ChosenOptions         int                             `json:"chosenOptions"`
}

type ChoiceQuestionOption struct {
	Text string `json:"text"`
}

type ChoiceQuestionOptionResponses struct {
	Text        string `json:"text"`
	TimesChosen int    `json:"timesChosen"`
}

type Question struct {
	QuestionID uuid.UUID        `json:"id"`
	FormID     uuid.UUID        `json:"formID"`
	Index      int              `json:"index"`
	Type       QuestionType     `json:"type"`
	Meta       QuestionMetaData `json:"meta"`
}

type QuestionResponses struct {
	QuestionID uuid.UUID                `json:"id"`
	FormID     uuid.UUID                `json:"formID"`
	Index      int                      `json:"index"`
	Type       QuestionType             `json:"type"`
	Meta       QuestionResponseMetaData `json:"meta"`
}

type QuestionEdit struct {
	FormID     uuid.UUID
	QuestionID uuid.UUID
	Index      int
	Type       QuestionType
	Meta       QuestionMetaData

	DeleteQuestion    bool
	OverwriteMetadata bool
}

func (q QuestionEdit) RemoveInternalData() Question {
	return Question{
		FormID:     q.FormID,
		QuestionID: q.QuestionID,
		Index:      q.Index,
		Type:       q.Type,
		Meta:       q.Meta,
	}
}
