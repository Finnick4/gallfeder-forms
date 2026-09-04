package parameters

type ParamsFormCreate struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type ParamsFormGet struct {
	Id string `json:"id"`
}
