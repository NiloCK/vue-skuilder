import { QuestionRecord, CardRecord, isQuestionRecord, CardHistory, areQuestionRecords } from '@/db/types';
import { duration, Moment } from 'moment';
import { log } from 'util';
import Store from '@/store';
import cardCache from './cardCache';
import { updateUserElo, User } from './userDB';

/**
 * Returns the minimum number of seconds that should pass before a
 * card is redisplayed for review / practice.
 *
 * @param cardHistory The user's history working with the given card
 */
export function newInterval(cardHistory: CardHistory<CardRecord>): number {
    const records = cardHistory.records;
    if (areQuestionRecords(cardHistory)) {
        return newQuestionInterval(cardHistory);
    } else {
        return 100000; // random - replace
    }
}

function newQuestionInterval(cardHistory: CardHistory<QuestionRecord>) {
    const records = cardHistory.records;
    const currentAttempt = records[records.length - 1];
    const lastInterval: number = lastSuccessfulInterval(records);

    if (lastInterval > cardHistory.bestInterval) {
        cardHistory.bestInterval = lastInterval;
        // update bestInterval on cardHistory in db
        User.instance().then((u) => {
            u.updateCardHistory(cardHistory.courseID, cardHistory.cardID, {
                bestInterval: lastInterval
            });
        });
    }

    if (currentAttempt.isCorrect) {
        const skill = demonstratedSkill(currentAttempt);
        log(`Demontrated skill: \t${skill}`);
        const interval: number = lastInterval * (0.75 + skill);
        cardHistory.lapses = getLapses(cardHistory.records);
        cardHistory.streak = getStreak(cardHistory.records);

        if (cardHistory.lapses && cardHistory.streak && cardHistory.bestInterval &&
            (cardHistory.lapses >= 0 || cardHistory.streak >= 0)) {
            // weighted average of best-ever performance vs current performance, based
            // on how often the card has been failed, and the current streak of success
            const ret = (cardHistory.lapses * interval + cardHistory.streak * cardHistory.bestInterval) /
                (cardHistory.lapses + cardHistory.streak);
            console.log(`Weighted average interval calculation:
\t(${cardHistory.lapses} * ${interval} + ${cardHistory.streak} * ${cardHistory.bestInterval}) / (${cardHistory.lapses} + ${cardHistory.streak}) = ${ret}`);
            return ret;
        } else {
            return interval;
        }
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
    for (let i = cardHistory.length - 1; i >= 1; i--) {
        if (
            cardHistory[i].priorAttemps === 0
            && cardHistory[i].isCorrect
        ) {
            const lastInterval = secondsBetween(cardHistory[i - 1].timeStamp, cardHistory[i].timeStamp);
            const ret = Math.max(lastInterval, 20 * 60 * 60);
            log(`Last interval w/ this card was: ${lastInterval}s, returning ${ret}s`);
            return ret;
        }
    }

    return getInitialInterval(cardHistory); // used as a magic number here - indicates no prior intervals
}

function getStreak(records: QuestionRecord[]): number {
    let streak = 0;
    let index = records.length - 1;

    while (index >= 0 && records[index].isCorrect) {
        index--;
        streak++;
    }

    return streak;
}
function getLapses(records: QuestionRecord[]): number {
    return records.filter(r => r.isCorrect === false).length;
}

function getInitialInterval(cardHistory: QuestionRecord[]): number {
    // todo make this a data-driven service, relying on:
    //  - global experience w/ the card (ie, what interval
    //      seems to be working well across the population)
    //  - the individual user (how do they respond in general
    //      when compared to the population)
    return 60 * 60 * 24 * 3; // 3 days
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
    // this value will be dynamic, populated from a service and based on
    // observed interations with the card
    const expertSpeed = 5000;
    const userSpeed = Math.min(response.timeSpent, 10 * expertSpeed);

    // if userResponse is > 10 x expertSpeed, discount as probably afk / distracted ?

    const speedPenalty = userSpeed / expertSpeed;
    const speedPenaltyMultiplier = userSpeed > expertSpeed ? Math.pow(0.8, speedPenalty) : 1;

    let ret = response.isCorrect ? 1 : 0;

    ret = ret * speedPenaltyMultiplier;

    return Math.min(ret, 1);
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
