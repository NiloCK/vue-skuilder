
/**
 * Returns an integer between (inclusive) the two inputs
 * @param min The smallest possible return value
 * @param max The largest possible return value
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
