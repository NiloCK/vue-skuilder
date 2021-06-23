export class EloRank {
  k: number;
  constructor(k?: number) {
    this.k = k || 32;
  }

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

export function adjustScores(
  userElo: number,
  cardElo: number,
  userScore: number,
  k?: number
): {
  userElo: number;
  cardElo: number;
} {
  const elo = new EloRank(k);
  const exp = elo.getExpected(userElo, cardElo);
  const upA = elo.updateRating(exp, userScore, userElo);
  const upB = elo.updateRating(1 - exp, 1 - userScore, cardElo);

  console.log(`ELO updates w/ user score ${userScore}
       user  |  card
init   ${userElo}         ${cardElo}
final  ${upA}         ${upB}
  `);

  return {
    userElo: upA,
    cardElo: upB,
  };
}
