export class EloRanker {
  constructor(public k: number = 32) {}

  setKFactor(k: number) {
    this.k = k;
  }
  getKFactor() {
    return this.k;
  }

  getExpected(a: number, b: number) {
    return 1 / (1 + Math.pow(10, (b - a) / 400));
  }
  updateRating(expected: number, actual: number, current: number) {
    return Math.round(current + this.k * (actual - expected));
  }
}

export type EloRank = {
  score: number;
  count: number;
};

/**
 * Calculates updated ELO scores for users and content after they interact
 *
 * @param userElo current ELO score of the user
 * @param cardElo current ELO score of the card
 * @param userScore user performance against the card in range [0,1]
 * @param k optional scaling factor. Higher values -> larger score adjustments. Default 32.
 * @returns
 */
export function adjustScores(
  userElo: number,
  cardElo: number,
  userScore: number,
  k: number = 32
): {
  userElo: number;
  cardElo: number;
} {
  if (userScore < 0 || userScore > 1) {
    throw new Error(`ELO performance rating must be between 0 and 1 - received ${userScore}`);
  }
  const elo = new EloRanker(k);
  const exp = elo.getExpected(userElo, cardElo);
  const updatedUserElo = elo.updateRating(exp, userScore, userElo);
  const updatedCardElo = elo.updateRating(1 - exp, 1 - userScore, cardElo);

  //   console.log(`ELO updates w/ user score ${userScore}
  //        user  |  card
  // init   ${userElo}         ${cardElo}
  // final  ${updatedUserElo}         ${updatedCardElo}
  //   `);

  return {
    userElo: updatedUserElo,
    cardElo: updatedCardElo,
  };
}
