import { QuestionRecord } from '@/db/types';
import { duration, Moment } from 'moment';

/**
 * Returns the number of seconds that should pass before a
 * card is redisplayed for review / practice.
 *
 * @param cardHistory The user's history working with the given card
 */
function newInterval(cardHistory: QuestionRecord[]): number {
    const currentAttempt = cardHistory[cardHistory.length - 1];

    if (currentAttempt.isCorrect) {
        return 0;
    }

    return 0;
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

    // if userResponse is > 10 x expertSpeed, discount as probably afk / distracted ?

    const speedPenalty = response.timeSpent / expertSpeed;
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
    return duration(start.diff(end)).asSeconds();
}
