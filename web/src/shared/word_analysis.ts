
export const getWordCountFromTextResponses = (responses: string[]): Map<string, number> => {
    const wordCount = new Map<string, number>();

    const increaseWordCount = (word: string) => {
        if (word.length == 0) {
            return;
        }
        const count = wordCount.get(word);
        wordCount.set(word, count ? count + 1 : 1);
    }

    for (const resp of responses) {
        if (resp.length == 0) {
            continue;
        }
        let wordStartIndex = 0;

        for (let i = 0; i < resp.length; i++) {
            const char = resp.charAt(i).toLowerCase();
            if (char.match(/[a-z]/)) {
                continue;
            }

            const word = resp.substring(wordStartIndex, i).toLowerCase();
            increaseWordCount(word);
            wordStartIndex = i + 1;
        }
        if (resp.charAt(resp.length - 1).toLowerCase().match(/[a-z]|-/)) {
            const word = resp.substring(wordStartIndex, resp.length).toLowerCase();
            increaseWordCount(word);
        }
    }
    return wordCount;
}
