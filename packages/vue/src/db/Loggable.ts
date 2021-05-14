export abstract class Loggable {
  protected abstract readonly _className: string;
  protected log(s: string) {
    console.log(`LOG-${this._className}@${new Date()}:
\t${s}`);
  }
}
