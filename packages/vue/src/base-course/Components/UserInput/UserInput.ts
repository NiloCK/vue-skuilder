import SkldrVue from '../../../SkldrVue';
import { Prop, Vue } from 'vue-property-decorator';
import { Answer, Question } from '../../../base-course/Displayable';
import { QuestionView } from '../../../base-course/Viewable';
import { log } from 'util';
import { QuestionRecord } from '../../../db/types';

export default abstract class UserInput extends Vue {
  public $el: HTMLElement;
  /**
   * This is the .submitAnswer from the parent
   */
  protected submitAnswer: (answer: Answer) => QuestionRecord = this.submit;

  protected answer: Answer = '';
  protected get autofocus(): boolean {
    return !this.$store.state.cardPreviewMode;
  }
  protected get autoFocus(): boolean {
    return this.autofocus;
  }

  /**
   * Use this lifecycle method to apply focus()
   * to the input element.
   */
  public abstract mounted(): void;

  private isQuestionView(a: any): a is QuestionView<Question> {
    return (a as QuestionView<Question>).submitAnswer !== undefined;
  }

  private submit(answer: Answer) {
    const thisClassname = this.constructor.name;
    return this.getQuestionViewAncestor().submitAnswer(answer, thisClassname);
  }

  private getQuestionViewAncestor(): QuestionView<Question> {
    let ancestor = this.$parent;
    let count = 0;

    while (ancestor && !this.isQuestionView(ancestor)) {
      const nextAncestor = ancestor.$parent;
      if (!nextAncestor) {
        const err = `
UserInput.submit() has failed.
The input element has no QuestionView ancestor element.`;
        log(err);
        throw new Error(err);
      }
      ancestor = nextAncestor;
      count++;

      if (count > 100) {
        const err = `
UserInput.submit() has failed.
Exceeded maximum ancestor lookup depth.`;
        log(err);
        throw new Error(err);
      }
    }

    if (!ancestor) {
      throw new Error('No QuestionView ancestor found');
    }

    return ancestor;
  }
}
