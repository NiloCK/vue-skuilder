import { Prop, Vue } from 'vue-property-decorator';
import { Answer, Question } from '@/base-course/Course';
import { QuestionView } from '@/base-course/Viewable';
import { log } from 'util';

export default abstract class UserInput extends Vue {
    /**
     * This is the .submitAnswer from the parent
     */
    @Prop() protected submitAnswer: (answer: Answer) => void = this.submit;

    protected answer: Answer = '';

    /**
     * Use this lifecycle method to apply focus()
     * to the input element.
     */
    public abstract mounted(): void;

    private isQuestionView(a: any): a is QuestionView<Question> {
        return (a as QuestionView<Question>).submitAnswer !== undefined;
    }

    private submit(answer: Answer) {
        if (this.isQuestionView(this.$parent)) {
            this.$parent.submitAnswer(
                answer
            );
        } else {
            const err: string = `UserInput.submit() has failed.`;
            log(err);
            throw new Error(err);
        }
    }

}
