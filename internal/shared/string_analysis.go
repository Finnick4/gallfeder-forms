package shared

import (
	"maps"
	"sort"
	"strings"
	"sync"
	"unicode"
)

type TextAnalysis struct {
	Samples         int              `json:"samples"`
	TotalWords      int              `json:"totalWords"`
	WordOccurrences []WordOccurrence `json:"wordOccurrences"`
}

type WordOccurrence struct {
	Word       string `json:"word"`
	Occurrence int    `json:"occurrence"`
}

type InternalTextAnalysis struct {
	Samples         int
	TotalWords      int
	WordOccurrences map[string]int
}

func (i InternalTextAnalysis) Polish(n int) TextAnalysis {
	a := TextAnalysis{
		Samples:         i.Samples,
		TotalWords:      i.TotalWords,
		WordOccurrences: nil,
	}

	wo := make([]WordOccurrence, len(i.WordOccurrences))
	index := 0

	for word, occurrences := range i.WordOccurrences {
		wo[index] = WordOccurrence{
			Word:       word,
			Occurrence: occurrences,
		}
		index++
	}

	sort.Slice(wo, func(i, j int) bool { return wo[i].Occurrence > wo[j].Occurrence })

	if n < 0 || n > cap(wo) {
		a.WordOccurrences = wo
	} else {
		a.WordOccurrences = wo[:n]
	}
	return a
}

func (i InternalTextAnalysis) Merge(toMerge InternalTextAnalysis) InternalTextAnalysis {
	merged := InternalTextAnalysis{
		Samples:         i.Samples + toMerge.Samples,
		TotalWords:      i.TotalWords + toMerge.TotalWords,
		WordOccurrences: make(map[string]int),
	}
	maps.Copy(merged.WordOccurrences, i.WordOccurrences)

	for w, occ := range toMerge.WordOccurrences {
		if merged.WordOccurrences[w] == 0 {
			merged.WordOccurrences[w] = occ
			continue
		}
		merged.WordOccurrences[w] += occ
	}

	return merged
}

func AnalyseString(str string) InternalTextAnalysis {
	if len(str) == 0 {
		return InternalTextAnalysis{
			Samples:         0,
			TotalWords:      0,
			WordOccurrences: make(map[string]int),
		}
	}
	a := InternalTextAnalysis{
		Samples:         1,
		TotalWords:      0,
		WordOccurrences: make(map[string]int),
	}
	addWordOccurrence := func(word string) {
		if word == "" {
			return
		}
		a.TotalWords++
		a.WordOccurrences[word]++
	}
	wordStart := 0

	for i, char := range str {
		if unicode.IsLetter(char) {
			continue
		}
		word := strings.ToLower(str[wordStart:i])
		addWordOccurrence(word)
		wordStart = i + 1
	}
	if unicode.IsLetter(rune(str[len(str)-1])) {
		word := strings.ToLower(str[wordStart:])
		addWordOccurrence(word)
	}
	return a
}

func AnalyseStrings(strs []string) InternalTextAnalysis {
	if len(strs) == 0 {
		return InternalTextAnalysis{
			Samples:         0,
			TotalWords:      0,
			WordOccurrences: make(map[string]int),
		}
	}
	if len(strs) == 1 {
		return AnalyseString(strs[0])
	}

	var a, b InternalTextAnalysis
	wg := sync.WaitGroup{}
	wg.Add(2)
	go func() {
		a = AnalyseStrings(strs[:(len(strs) / 2)])
		wg.Done()
	}()
	go func() {
		b = AnalyseStrings(strs[(len(strs) / 2):])
		wg.Done()
	}()
	wg.Wait()

	return a.Merge(b)
}
