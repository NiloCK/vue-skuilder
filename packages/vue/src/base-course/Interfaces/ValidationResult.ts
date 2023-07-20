import { Status } from '../../enums/Status';

export interface ValidationResult {
  status: Status;
  msg: string;
}
