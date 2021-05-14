import { Answer } from '../Displayable';

export interface RadioMultipleChoiceAnswer extends Answer {
  choiceList: string[];
  selection: number;
}
