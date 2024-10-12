function gradeSpellingAttempt(attempt: string, answer: string): string {
  const result: string[] = new Array(answer.length).fill('_');
  let attemptChars = attempt.split('');

  // First pass: match characters in correct positions
  for (let i = 0; i < answer.length; i++) {
    if (i < attemptChars.length && attemptChars[i] === answer[i]) {
      result[i] = attemptChars[i];
      attemptChars[i] = '';
    }
  }

  // Second pass: match remaining characters from right to left
  for (let i = answer.length - 1; i >= 0; i--) {
    if (result[i] === '_') {
      const charIndex = attemptChars.findIndex(char => char === answer[i]);
      if (charIndex !== -1) {
        result[i] = answer[i];
        attemptChars[charIndex] = '';
      }
    }
  }

  return result.join(' ');
}

export default gradeSpellingAttempt;
