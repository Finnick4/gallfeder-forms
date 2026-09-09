package parameters

import "gallfeder-forms/internal/shared"

type ParamsResponseCreate struct {
	Answers []shared.QuestionAnswer `json:"answers"`
}
