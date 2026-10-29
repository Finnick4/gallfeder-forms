package shared

import "testing"

func TestAnalyseEmptyString(t *testing.T) {
	a := AnalyseString("")
	if a.TotalWords != 0 {
		t.Errorf("Total number of words for empty string is %d and not 0!\n", a.TotalWords)
	}
	if a.Samples != 0 {
		t.Errorf("Number of samples for empty string is %d and not 0!\n", a.Samples)
	}
	if len(a.WordOccurrences) != 0 {
		t.Errorf("Word occurrences map of samples for empty string contains %d elements and is not empty!\n", len(a.WordOccurrences))
	}
}

func TestAnalyseSingleString(t *testing.T) {
	a := AnalyseString("The quick brown fox jumps over the lazy dog!")

	if a.TotalWords != 9 {
		t.Errorf("Total number of words in string is off (%d; expected 9)!\n", a.TotalWords)
	}
	if a.Samples != 1 {
		t.Errorf("Number of samples with one string is off (%d; expected 1)!\n", a.Samples)
	}
	if len(a.WordOccurrences) != 8 {
		t.Fatalf("Number of entries in word occurrences map of string is off (%d; expected 8)!\n", len(a.WordOccurrences))
	}
	testWordOccurrences := func(word string, expected int) {
		if a.WordOccurrences[word] != expected {
			t.Errorf("Number of occurrences of word '%s' is off (%d; expected %d)!\n", word, a.WordOccurrences[word], expected)
		}
	}
	testWordOccurrences("The", 0)
	testWordOccurrences("the", 2)
	testWordOccurrences("quick", 1)
	testWordOccurrences("brown", 1)
	testWordOccurrences("fox", 1)
	testWordOccurrences("jumps", 1)
	testWordOccurrences("over", 1)
	testWordOccurrences("lazy", 1)
	testWordOccurrences("dog", 1)
}

func TestMergeAnalysis(t *testing.T) {
	a1 := InternalTextAnalysis{
		Samples:    2,
		TotalWords: 5,
		WordOccurrences: map[string]int{
			"the":       2,
			"forms":     1,
			"helpdesk":  1,
			"testsuite": 1,
		},
	}
	a2 := InternalTextAnalysis{
		Samples:    2,
		TotalWords: 4,
		WordOccurrences: map[string]int{
			"the":      1,
			"forms":    2,
			"pipeline": 1,
		},
	}
	merged := a1.Merge(a2)

	if merged.TotalWords != 9 {
		t.Errorf("Total number of words is off (%d; expected 9)!\n", merged.TotalWords)
	}
	if merged.Samples != 4 {
		t.Errorf("Number of samples is off (%d; expected 4)!\n", merged.Samples)
	}
	if len(merged.WordOccurrences) != 5 {
		t.Fatalf("Number of entries in word occurrences map of string is off (%d; expected 5)!\n", len(merged.WordOccurrences))
	}
	testWordOccurrences := func(word string, expected int) {
		if merged.WordOccurrences[word] != expected {
			t.Errorf("Number of occurrences of word '%s' is off (%d; expected %d)!\n", word, merged.WordOccurrences[word], expected)
		}
	}
	testWordOccurrences("the", 3)
	testWordOccurrences("forms", 3)
	testWordOccurrences("helpdesk", 1)
	testWordOccurrences("testsuite", 1)
	testWordOccurrences("pipeline", 1)
}

func TestAnalyseNoStringsProvided(t *testing.T) {
	a := AnalyseStrings([]string{})
	if a.TotalWords != 0 {
		t.Errorf("Total number of words for empty slice of strings is off (%d; expected 0)!\n", a.TotalWords)
	}
	if a.Samples != 0 {
		t.Errorf("Number of samples for empty slice of strings is off (%d; expected 0)!!\n", a.Samples)
	}
	if len(a.WordOccurrences) != 0 {
		t.Errorf("Number of entries in word occurrences map for empty slice of strings is off (%d; expected 0)!\n", len(a.WordOccurrences))
	}
}

func TestAnalyseMultipleStrings(t *testing.T) {
	a := AnalyseStrings([]string{
		"The quick brown fox jumps over the lazy dog!",
		"The quick, brown fox jumps over the lazy dog",
		"The quick brown fox jumps. over the lazy dog!",
		"The quick brown fox; jumps over the lazy dog;",
		"The quick brown fox jumps over the lazy dog,",
	})

	if a.TotalWords != 45 {
		t.Errorf("Total number of words in string is off (%d; expected 45)!\n", a.TotalWords)
	}
	if a.Samples != 5 {
		t.Errorf("Number of samples with one string is off (%d; expected 5)!\n", a.Samples)
	}
	if len(a.WordOccurrences) != 8 {
		t.Fatalf("Number of entries in word occurrences map of string is off (%d; expected 8)!\n", len(a.WordOccurrences))
	}
	testWordOccurrences := func(word string, expected int) {
		if a.WordOccurrences[word] != expected {
			t.Errorf("Number of occurrences of word '%s' is off (%d; expected %d)!\n", word, a.WordOccurrences[word], expected)
		}
	}
	testWordOccurrences("The", 0)
	testWordOccurrences("the", 10)
	testWordOccurrences("quick", 5)
	testWordOccurrences("brown", 5)
	testWordOccurrences("fox", 5)
	testWordOccurrences("jumps", 5)
	testWordOccurrences("over", 5)
	testWordOccurrences("lazy", 5)
	testWordOccurrences("dog", 5)
}

func TestAnalyseMultipleStringsIncludingEmpty(t *testing.T) {
	a := AnalyseStrings([]string{
		"The quick brown fox jumps over the lazy dog!",
		"",
		"",
	})

	if a.TotalWords != 9 {
		t.Errorf("Total number of words in string is off (%d; expected 9)!\n", a.TotalWords)
	}
	if a.Samples != 1 {
		t.Errorf("Number of samples with one string is off (%d; expected 1)!\n", a.Samples)
	}
	if len(a.WordOccurrences) != 8 {
		t.Fatalf("Number of entries in word occurrences map of string is off (%d; expected 8)!\n", len(a.WordOccurrences))
	}
	testWordOccurrences := func(word string, expected int) {
		if a.WordOccurrences[word] != expected {
			t.Errorf("Number of occurrences of word '%s' is off (%d; expected %d)!\n", word, a.WordOccurrences[word], expected)
		}
	}
	testWordOccurrences("The", 0)
	testWordOccurrences("the", 2)
	testWordOccurrences("quick", 1)
	testWordOccurrences("brown", 1)
	testWordOccurrences("fox", 1)
	testWordOccurrences("jumps", 1)
	testWordOccurrences("over", 1)
	testWordOccurrences("lazy", 1)
	testWordOccurrences("dog", 1)
}

func TestAnalyseMultipleEmptyStrings(t *testing.T) {
	a := AnalyseStrings([]string{"", "", ""})
	if a.TotalWords != 0 {
		t.Errorf("Total number of words for slice of empty strings is off (%d; expected 0)!\n", a.TotalWords)
	}
	if a.Samples != 0 {
		t.Errorf("Number of samples for slice of empty strings is off (%d; expected 0)!!\n", a.Samples)
	}
	if len(a.WordOccurrences) != 0 {
		t.Errorf("Number of entries in word occurrences map for slice of empty strings is off (%d; expected 0)!\n", len(a.WordOccurrences))
	}
}

func TestPolishAnalysisWithoutCutoff(t *testing.T) {
	polished := InternalTextAnalysis{
		TotalWords: 9,
		Samples:    1,
		WordOccurrences: map[string]int{
			"the":   2,
			"quick": 1,
			"brown": 1,
			"fox":   1,
			"jumps": 1,
			"over":  1,
			"lazy":  1,
			"dog":   1,
		},
	}.Polish(-1)

	if polished.TotalWords != 9 {
		t.Errorf("Total number of words is off (%d; expected 9)!\n", polished.TotalWords)
	}
	if polished.Samples != 1 {
		t.Errorf("Number of samples is off (%d; expected 1)!\n", polished.Samples)
	}
	if len(polished.WordOccurrences) != 8 {
		t.Fatalf("Size of slice of word occurrences is off (%d; expected 8)!\n", len(polished.WordOccurrences))
	}

	expectedOccurrences := map[string]int{
		"the":   2,
		"quick": 1,
		"brown": 1,
		"fox":   1,
		"jumps": 1,
		"over":  1,
		"lazy":  1,
		"dog":   1,
	}

	checkWordOccurrences(t, expectedOccurrences, polished.WordOccurrences)
}

func TestPolishAnalysisWithEverythingCutOff(t *testing.T) {
	polished := InternalTextAnalysis{
		TotalWords: 9,
		Samples:    1,
		WordOccurrences: map[string]int{
			"the":   2,
			"quick": 1,
			"brown": 1,
			"fox":   1,
			"jumps": 1,
			"over":  1,
			"lazy":  1,
			"dog":   1,
		},
	}.Polish(0)

	if polished.TotalWords != 9 {
		t.Errorf("Total number of words is off (%d; expected 9)!\n", polished.TotalWords)
	}
	if polished.Samples != 1 {
		t.Errorf("Number of samples is off (%d; expected 1)!\n", polished.Samples)
	}
	if len(polished.WordOccurrences) != 0 {
		t.Fatalf("Size of slice of word occurrences is off (%d; expected 0)!\n", len(polished.WordOccurrences))
	}
}

func TestPolishAnalysisWithSpecificCutoff(t *testing.T) {
	polished := InternalTextAnalysis{
		TotalWords: 16,
		Samples:    3,
		WordOccurrences: map[string]int{
			"the":   5,
			"quick": 6,
			"brown": 4,
			"fox":   3,
			"jumps": 1,
			"over":  2,
			"lazy":  2,
			"dog":   3,
		},
	}.Polish(5)

	if polished.TotalWords != 16 {
		t.Errorf("Total number of words is off (%d; expected 16)!\n", polished.TotalWords)
	}
	if polished.Samples != 3 {
		t.Errorf("Number of samples is off (%d; expected 3)!\n", polished.Samples)
	}
	if len(polished.WordOccurrences) != 5 {
		t.Fatalf("Size of slice of word occurrences is off (%d; expected 5)!\n", len(polished.WordOccurrences))
	}

	expectedOccurrences := map[string]int{
		"the":   5,
		"quick": 6,
		"brown": 4,
		"fox":   3,
		"dog":   3,
	}

	checkWordOccurrences(t, expectedOccurrences, polished.WordOccurrences)
}

func checkWordOccurrences(t *testing.T, expected map[string]int, returned []WordOccurrence) {
	for _, occurrence := range returned {
		if expected[occurrence.Word] != occurrence.Occurrence {
			t.Errorf("Number of occurrences of word '%s' is off (%d; expected %d)!\n", occurrence.Word, occurrence.Occurrence, expected[occurrence.Word])
		}
		delete(expected, occurrence.Word)
	}

	if len(expected) != 0 {
		t.Errorf("Some words were not provided in polished analysis (%d remaining: %v)!\n", len(expected), expected)
	}
}
