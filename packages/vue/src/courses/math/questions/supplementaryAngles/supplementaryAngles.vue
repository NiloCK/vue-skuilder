<template>
  <div>
    <h2>What is the measurement of the highlighted angle?</h2>
    <canvas ref="canvas" width="300" height="300"> </canvas>
    <br />
    <user-input-number />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { SupplementaryAngles } from './index';
import UserInputNumber from '@/base-course/Components/UserInput/UserInputNumber.vue';
import { randomInt, cos, sin } from '../../utility';
import paper, { PaperScope } from 'paper';
import { log } from 'util';

@Component({
  components: {
    UserInputNumber,
  },
})
export default class CalculateSupplementaryAngle extends QuestionView<SupplementaryAngles> {
  get question() {
    return this._question;
  }
  public $refs: {
    canvas: HTMLCanvasElement;
  };
  private angle: number;
  private _question: SupplementaryAngles;
  private _p?: paper.PaperScope;

  public beforeDestroy() {
    // destroy paperscope instance
    // this._p.
    delete this._p;
  }

  private created() {
    this.angle = randomInt(10, 83);
    this._question = new SupplementaryAngles(this.data);
  }

  private mounted() {
    this.$nextTick(function () {
      this._p = new paper.PaperScope();
      this._p.setup(this.$refs.canvas);
      const p = this._p;

      const width = this.$refs.canvas.width;
      const height = this.$refs.canvas.height;

      const baseAngle = randomInt(0, 360);
      const otherArm = baseAngle + this.angle;

      const xOffset = width * cos(baseAngle);
      const yOffset = width * sin(baseAngle);

      const baseLine = new p.Path.Line({
        from: new p.Point(width / 2 + xOffset, height / 2 + yOffset),
        to: new p.Point(width / 2 - xOffset, height / 2 - yOffset),
      });
      baseLine.strokeColor = new paper.Color('black');

      let sum: number = 0;
      const armPaths: paper.Path[] = [];

      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.question.angles.length; i++) {
        const angle = this.question.angles[i];
        sum += this.question.angles[i];

        log(`drawing angle ${i}:
          angle: ${angle}
          angleSum: ${sum}
          `);

        let nextArm: number;
        const thisArm: number = sum - angle;
        if (i === this.question.angles.length - 1) {
          nextArm = 180;
        } else {
          nextArm = sum;
        }

        const firstArm: paper.Point = new p.Point(
          width / 2 + 30 * cos(baseAngle + thisArm),
          height / 2 + 30 * sin(baseAngle + thisArm)
        );
        const middleArm: paper.Point = this.getBisectingPoint(p, width, baseAngle, thisArm, nextArm, height);
        const secondArm: paper.Point = new p.Point(
          width / 2 + 30 * cos(baseAngle + nextArm),
          height / 2 + 30 * sin(baseAngle + nextArm)
        );

        const xOff = width * cos(baseAngle + sum);
        const yOff = width * sin(baseAngle + sum);

        const angleLine = new p.Path.Line({
          from: new p.Point(width / 2, height / 2),
          to: new p.Point(width / 2 + xOff, height / 2 + yOff),
        });
        angleLine.strokeColor = new paper.Color(0, 0, 0);
        armPaths.push(angleLine);

        if (this.question.targetAngleIndex === i) {
          log(`drawing targetAngle at i = ${i}:
            baseAngle: ${baseAngle}
            targetAngle: ${angle}
            sum: ${sum}
            nextAngle: ${nextArm}
            `);

          const fill = new paper.Color(0.1, 0.5, 0.8, 0.35);

          const arc = new p.Path.Arc({
            from: firstArm,
            through: middleArm,
            to: secondArm,
          });
          arc.strokeColor = new paper.Color(0.1, 0.5, 0.8, 0.75);
          arc.strokeWidth = 3;
          arc.fillColor = fill;

          const triangle = new p.Path();
          triangle.closed = true;
          triangle.add(firstArm);
          triangle.add(new paper.Point(width / 2, height / 2));
          triangle.add(secondArm);
          triangle.fillColor = fill;
        } else {
          // draw the angle measure
          const measure = new paper.PointText(middleArm);
          measure.content = angle.toString() + '°';

          let intersection: boolean = true;
          let scale: number = 20;

          while (intersection) {
            intersection = false;

            measure.bounds!.center = this.getBisectingPoint(p, width, baseAngle, thisArm, nextArm, height, scale);

            armPaths.forEach((path) => {
              if (path.intersects(measure)) {
                intersection = true;
              }
            });
            scale += 7;
          }
        }
      }
    });
  }

  private getBisectingPoint(
    p: paper.PaperScope,
    width: number,
    baseAngle: number,
    firstAngle: number,
    secondAngle: number,
    height: number,
    scale: number = 30
  ): paper.Point {
    return new p.Point(
      width / 2 + scale * cos(baseAngle + (firstAngle + secondAngle) / 2),
      height / 2 + scale * sin(baseAngle + (firstAngle + secondAngle) / 2)
    );
  }
}
</script>

<style lang="css" scoped>
canvas {
  display: block;
  margin-left: auto;
  margin-right: auto;
  padding: 10px;
}
</style>
