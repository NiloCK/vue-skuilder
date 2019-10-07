<template>
  <div>
    <!-- {{ question.angleCategory }} angle ... {{ angle }} degrees -->
    <canvas ref="canvas" width=300 height=300 >

    </canvas>

    <radio-multiple-choice
      :choiceList=question.answers
      :MouseTrap=MouseTrap
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { AngleCategorize, AngleCategories } from './index';
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';
import RadioMultipleChoice from '@/base-course/Components/RadioMultipleChoice.vue';
import { randomInt } from '../../utility';

@Component({
  components: {
    UserInputNumber,
    RadioMultipleChoice
  }
})
export default class AngleCategorizeV extends QuestionView<AngleCategorize> {
  private angle: number;
  $refs: {
    canvas: HTMLCanvasElement
  }

  created() {
    this.angle = ((category) => {
      if (category === AngleCategories.ACUTE) {
        return randomInt(10, 83)
      } else if (category === AngleCategories.RIGHT) {
        return 90;
      } else if (category === AngleCategories.OBTUSE) {
        return randomInt(97, 173);
      } else if (category === AngleCategories.STRAIGHT) {
        return 180;
      } else if (category === AngleCategories.REFLEX) {
        return randomInt(190, 350);
      } else {
        throw new Error("Unknown Angle type on AngleCategorize question");
      }
    })(this.question.angleCategory);
  }

  mounted() {
    this.$nextTick(
      function () {
        const width = this.$refs.canvas.width;
        const height = this.$refs.canvas.height;
        const ctx: CanvasRenderingContext2D = this.$refs.canvas.getContext('2d')!;

        const baseArm = randomInt(0, 360);
        const otherArm = baseArm + this.angle;

        ctx.moveTo(width / 2, height / 2);
        let x = (width / 2) + width * Math.cos((baseArm / 360) * 2 * Math.PI);
        let y = (height / 2) + width * Math.sin((baseArm / 360) * 2 * Math.PI);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.moveTo(width / 2, height / 2);
        let x2 = (width / 2) + width * Math.cos((otherArm / 360) * 2 * Math.PI);
        let y2 = (height / 2) + width * Math.sin((otherArm / 360) * 2 * Math.PI);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.moveTo(width / 2, height / 2);
        ctx.beginPath();
        ctx.arc(width / 2,
          height / 2,
          25,
          (baseArm / 360) * 2 * Math.PI,
          (otherArm / 360) * 2 * Math.PI,
        );
        ctx.stroke();
      }
    )

  }

  get question() {
    return new AngleCategorize(this.data);
  }

  public submit() {
    // this.question.isCorrect();
  }
}
</script>

<style lang="css" scoped>
</style>