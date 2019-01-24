import { QuestionRecord, CardRecord, isQuestionRecord } from '@/db/types';
import { duration, Moment } from 'moment';
import { log } from 'util';

/**
 * Returns the number of seconds that should pass before a
 * card is redisplayed for review / practice.
 *
 * @param cardHistory The user's history working with the given card
 */
export function newInterval<T extends CardRecord>(cardHistory: T[]): number {
    if (isQuestionRecord(cardHistory[0])) {
        return newQuestionInterval(cardHistory as unknown as QuestionRecord[]);
    } else {
        return 10000; // random - replace
    }
}

function newQuestionInterval(cardHistory: QuestionRecord[]) {
    const currentAttempt = cardHistory[cardHistory.length - 1];
    const lastInterval: number = lastSuccessfulInterval(cardHistory);

    if (currentAttempt.isCorrect) {
        const skill = demonstratedSkill(currentAttempt);
        return lastInterval * (0.5 + skill);
    } else {
        return 0;
    }
}

/**
 * Returns the amount of time, in seconds, of the most recent successful
 * interval for this card. An interval is successful if the user answers
 * a question correctly on the first attempt.
 * 
 * @param cardHistory The record of user attempts with the question
 */
function lastSuccessfulInterval(cardHistory: QuestionRecord[]): number {
    for (let i = cardHistory.length - 1; i >= 1; i++) {
        if (
            cardHistory[i].priorAttemps === 0
            && cardHistory[i].isCorrect
        ) {
            return secondsBetween(cardHistory[i - 1].timeStamp, cardHistory[i].timeStamp);
        }
    }

    return 0; // used as a magic number here - indicates no prior intervals
}

/**
 * Returns a number from (0, 1) representing the user's perceived skill
 * in answering the question. 0 representing beginner skill and 1 representing
 * expert skill.
 *
 * @param response the record of the user's interaction with the card
 */
function demonstratedSkill(response: QuestionRecord) {
    // this function will be dependant on external factors including:
    // - typical response times to the card type / individual card among the community
    // - the student's general responsiveness (eg, students with observed
    //   processing speed deficits can be given an amout of 'buffering' time)
    // - the context in which the question was asked: eg, 7*4 is easier to answer
    //   if the previous question was 6*4. It's easier still as a member of the
    //   chain of questions 2*4, 3*4, 4*4, 5*4, 6*4, ...

    // experts should answer this question in <= 5 secnods (5000 ms)
    // this value will be dynamic, populated from a service
    const expertSpeed = 5000;
    const userSpeed = Math.min(response.timeSpent, 10 * expertSpeed);

    // if userResponse is > 10 x expertSpeed, discount as probably afk / distracted ?

    const speedPenalty = userSpeed / expertSpeed;
    const speedPenaltyMultiplier = Math.pow(0.8, speedPenalty);

    let ret = response.isCorrect ? 1 : 0;

    ret = ret * speedPenaltyMultiplier;

    return Math.min(ret, 1);
}

function intervalMultiplier(responseSkill: number) {
    return 1;
}

/**
 * Returns a list of prior viewing intervals in seconds.
 * @param cardHistory
 */
function getPreviousIntervals(cardHistory: QuestionRecord[]): number[] {
    const ret: number[] = [];

    cardHistory.forEach((card, index) => {
        if (index > 0) {
            ret.push(
                secondsBetween(
                    cardHistory[index - 1].timeStamp,
                    cardHistory[index].timeStamp
                )
            );
        }
    });

    return ret;
}

/**
 * Returns the time in seconds between two Moment objects
 * @param start The first time
 * @param end The second time
 */
function secondsBetween(start: Moment, end: Moment): number {
    const ret = duration(end.diff(start)).asSeconds();
    // log(`From start: ${start} to finish: ${end} is ${ret} seconds`);
    return ret;
}
