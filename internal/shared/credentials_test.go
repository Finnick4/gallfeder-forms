package shared

import (
	"errors"
	"testing"
)

func TestIsPermittedPassword(t *testing.T) {
	expected := map[string]bool{
		"abc":       false,
		"admin123!": true,
		"APasswordThatIsWayTooLongAndShouldThusBeRejectedByThisFunctionSimplyOnTheBasisOfItsLength": false,
	}

	for pw, exp := range expected {
		if IsPermittedPassword(pw) != exp {
			t.Errorf("Validity mismatch with password '%s' (%v; expected: %v)!\n", pw, !exp, exp)
		}
	}
}

func TestHashPWValid(t *testing.T) {
	hash, err := HashPW("admin123!")
	if err != nil {
		t.Fatalf("Got unexpected error for valid password: %s\n", err)
	}
	if len(hash) == 0 {
		t.Errorf("Got empty string as hash for password!")
	}
}

func TestHashPWInvalid(t *testing.T) {
	_, err := HashPW("abc")
	if err == nil || !errors.Is(err, ErrPWInvalid) {
		t.Errorf("Did not get (correct) error for invalid password!")
	}
	if err != nil && !errors.Is(err, ErrPWInvalid) {
		t.Fatalf("Got unexpected error for valid password: %s\n", err)
	}
}

func TestCouldBeValidToken(t *testing.T) {
	expected := map[string]bool{
		"abc": false,
		"a752e38e08fab60600d42e5a9d43141d33d0af0bbf58c63ea66c133b70100a57":       true,
		"a752e38e08fab60600d42e5a9d43141d33d0af0bbf58c63ea66c133b70100a56":       false,
		"b752e38e08fab60600d42e5a9d43141d33d0af0bbf58c63ea66c133b70100a57":       false,
		"z752e38e08fab60600d42e5a9d43141d33d0af0bbf58c63ea66c133b70100a57":       false,
		"a752e38e08fab60600d42e5a9d43141d33d0af0bbf58c63ea66c133b70100a57aaaaaa": false,
	}

	for tok, exp := range expected {
		if CouldBeValidToken(tok) != exp {
			t.Errorf("Validity mismatch with token '%s' (%v; expected: %v)!\n", tok, !exp, exp)
		}
	}
}

func TestGenerateToken(t *testing.T) {
	tok, err := GenerateToken()
	if err != nil {
		t.Fatalf("Got error while generating token: %s\n", err)
	}
	if len(tok) != 64 {
		t.Errorf("Length of token is off (%d; expected 64)!\n", len(tok))
	}
	if !CouldBeValidToken(tok) {
		t.Error("Generated token cannot be valid!")
	}
}
