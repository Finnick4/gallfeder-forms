package shared

type DBMigration struct {
	Infotext   string   `json:"infotext"`
	Statements []string `json:"statements"`
}
