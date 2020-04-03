import webmidi, { WebMidi, Input, Output } from 'webmidi';

class SkMidi {
  private _instance: SkMidi;
  private webmidi: WebMidi = webmidi;
  private input: Input;
  private output: Output;

  private constructor() {
  }

  private async init() {
    this.webmidi.enable((err) => {
      if (err) {
        console.log(`Webmidi not enabled: ${err}`);
      } else {
        console.log(`Webmidi enabled`);

        // Viewing available inputs and outputs
        console.log(`Inputs: ${JSON.stringify(this.webmidi.inputs)}`);
        console.log(`Outputs: ${JSON.stringify(this.webmidi.outputs)}`);
        // this.outputs[0].playNote(['C4', 'E4', 'G4'], 1, {
        //   velocity: 0.25
        // });
      }
    });
  }

  public static async factory(): Promise<SkMidi> {
    let ret = new SkMidi();
    await ret.init();
    return ret;
  }

  public get inputs(): Input[] {
    return this.webmidi.inputs;
  }
  public get outputs(): Output[] {
    return this.webmidi.outputs;
  }
  public selectInput(id: string): void {
    if (this.webmidi.getInputById(id) !== false) {
      this.input = this.webmidi.getInputById(id) as Input;
    }
    this.input.on('noteon', 'all', (e) => {
      // do things w/ the note e...
    });
  }
  public selectOuput(index: number): void {
    this.output = this.outputs[index];
  }
}

export default SkMidi;