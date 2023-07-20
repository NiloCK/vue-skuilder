import { Validator } from '../../../base-course/Interfaces/Validator';
import { Status } from '../../../enums/Status';

/**
 * Returns an integer between (inclusive) the two inputs
 * @param min The smallest possible return value
 * @param max The largest possible return value
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns the cosine of an angle measured in degrees
 * @param degrees the angle measure in degrees
 */
export function cos(degrees: number) {
  return Math.cos(toRadians(degrees));
}

/**
 * Returns the sine of an angle measured in degrees
 * @param degrees the angle measure in degrees
 */
export function sin(degrees: number) {
  return Math.sin(toRadians(degrees));
}

function toRadians(degrees: number) {
  return (degrees / 360) * 2 * Math.PI;
}

export function intValidator(min: number, max: number): Validator {
  return {
    instructions: `This input must be an integer between ${min} and ${max}, inclusive.`,
    test: (value: string) => {
      return {
        status: Status.ok,
        msg: '',
      };
    },
  };
}
