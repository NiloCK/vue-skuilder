<template>
  <div>
    <h3>DataShapes</h3>
    <ul>
      <li v-for="dataShape in dataShapes" :key="dataShape.name">
        <v-btn small v-if="!dataShape.registered" @click="registerShape(dataShape.name)"> Register </v-btn>
        <span class="inset" v-else> (Registered) </span>
        {{ dataShape.name }}
        <ul>
          <div v-for="view in dataShape.dataShape.views" :key="view.name">
            <li v-if="view">
              {{ view.name }}
            </li>
          </div>
        </ul>
      </li>
    </ul>

    <h3>Questions</h3>
    <ul>
      <li v-for="question in questions" :key="question.name">
        <v-btn small v-if="!question.registered" @click="registerQuestionView(question.name)"> Register </v-btn>
        <span class="inset" v-else> (Registered) </span>
        {{ question.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Displayable } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import Courses from '@/courses';
import { NameSpacer, QuestionDescriptor } from '@/courses/NameSpacer';
import { addNote55, getCredentialledCourseConfig } from '@/db/courseAPI';
import { updateCredentialledCourseConfig } from '@/db/courseDB';
import { CourseConfig, DataShape55, QuestionType55 } from '@/server/types';
import SkldrVue from '@/SkldrVue';
import * as _ from 'lodash';
import { Component, Prop } from 'vue-property-decorator';

interface DataShapeRegistrationStatus {
  name: string;
  course: string; // the namespacing "in-code" course
  dataShape: DataShape;
  registered: boolean;
}

interface QuestionRegistrationStatus {
  name: string;
  course: string; // the namespacing "in-code" course
  question: typeof Displayable;
  registered: boolean;
}

@Component({
  components: {},
})
export default class ComponentRegistration extends SkldrVue {
  @Prop() public course: string;
  public dataShapes: (DataShapeRegistrationStatus & { displayable: typeof Displayable })[] = [];
  public questions: QuestionRegistrationStatus[] = [];

  private courseDatashapes: DataShape55[] = [];
  private courseQuestionTypes: QuestionType55[] = [];
  private courseConfig?: CourseConfig = undefined;

  public async created() {
    this.courseConfig = await getCredentialledCourseConfig(this.course);
    this.courseDatashapes = this.courseConfig.dataShapes;
    this.courseQuestionTypes = this.courseConfig.questionTypes;

    const dataShapeData = Courses.allDataShapes();

    Courses.allDataShapesRaw().forEach((ds) => {
      console.log(`[ComponentRegistration] Datashape:\n${JSON.stringify(ds)}`);
    });

    dataShapeData.forEach((shape) => {
      const index = this.courseDatashapes.find((test) => {
        return test.name === NameSpacer.getDataShapeString(shape);
      });

      this.dataShapes.push({
        name: shape.dataShape,
        course: shape.course,
        dataShape: Courses.getDataShape(shape),
        registered: index !== undefined,
        displayable: shape.displayable,
      });
    });

    this.dataShapes = _.sortBy(this.dataShapes, ['registered', 'name']);

    const courseNameList = Courses.courses.map((course) => course.name);
    const questionData: Array<[QuestionDescriptor, typeof Displayable]> = [];

    courseNameList.forEach((course) => {
      const courseQs = Courses.getCourse(course)!.questions;

      courseQs.forEach((courseQ) => {
        questionData.push([
          {
            course,
            questionType: courseQ.name,
          },
          courseQ,
        ]);
      });
    });

    questionData.forEach((question) => {
      const index = this.courseQuestionTypes.find((test) => {
        return NameSpacer.getQuestionString(question[0]) === test.name;
      });

      this.questions.push({
        course: question[0].course,
        name: question[1].name,
        registered: index !== undefined,
        question: question[1],
      });
    });
  }

  private async registerShape(shapeName: string) {
    const shape = this.dataShapes.find((findShape) => {
      return findShape.name === shapeName;
    })!;

    this.courseConfig!.dataShapes.push({
      name: NameSpacer.getDataShapeString({
        dataShape: shape.name,
        course: shape.course,
      }),
      questionTypes: [],
    });

    const update = await updateCredentialledCourseConfig(this.course, this.courseConfig!);

    if (update.ok) {
      shape.registered = true;

      // activate this when: adding a new questionView can find existing
      // notes in the db and create associated cards.
      //
      // if (shape.displayable.seedData) {
      //   console.log(`[ComponentRegistration] Datashape has seed data!`);
      //   shape.displayable.seedData.forEach((d) => {
      //     addNote55(
      //       this.course,
      //       shape.course,
      //       shape.displayable.dataShapes[0],
      //       d,
      //       this.$store.state._user!.username
      //     );
      //   });
      // } else {
      //   console.log(`[ComponentRegistration] Datashape has NO seed data!`);
      // }
    }
  }

  private async registerQuestionView(questionName: string) {
    const question = this.questions.find((q) => {
      return q.name === questionName;
    })!;

    const nsQuestionName = NameSpacer.getQuestionString({
      course: question.course,
      questionType: question.name,
    });

    this.courseConfig!.questionTypes.push({
      name: nsQuestionName,
      viewList: question.question.views.map((v) => v.name),
      dataShapeList: question.question.dataShapes.map((d) =>
        NameSpacer.getDataShapeString({
          course: question.course,
          dataShape: d.name,
        })
      ),
    });

    // associate the question type with existing registered dataTypes
    question.question.dataShapes.forEach((ds) => {
      const nsDatashapeName = NameSpacer.getDataShapeString({
        course: question.course,
        dataShape: ds.name,
      });

      for (const db of this.courseConfig!.dataShapes) {
        if (db.name === nsDatashapeName) {
          db.questionTypes.push(nsQuestionName);
        }
      }
    });

    const update = await updateCredentialledCourseConfig(this.course, this.courseConfig!);

    if (update.ok) {
      question.registered = true;
      console.log(`[ComponentRegistration]
Question: ${JSON.stringify(question)}
CourseID: ${this.course}
      `);
      if (question.question.seedData) {
        console.log(`[ComponentRegistration] Question has seed data!`);
        question.question.seedData.forEach((d) => {
          addNote55(
            this.course,
            question.course,
            question.question.dataShapes[0],
            d,
            this.$store.state._user!.username,
            []
          );
        });
      } else {
        console.log(`[ComponentRegistration] Question has NO seed data!`);
      }
    }
  }
}
</script>

<style scoped>
div {
  margin-top: 15px;
}

.inset {
  background-color: rgb(240, 240, 243);
  font-size: smaller;
  padding: 2px;
  border-radius: 2px;
}
</style>
