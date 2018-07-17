<template>
  <div>
    <h3>DataShapes</h3>
    <ul>
      <li v-for="dataShape in dataShapes" :key="dataShape.name" >
       {{ dataShape.name }}
        <button
          v-if="!dataShape.registered"
          @click="registerShape(dataShape.name)">
          Register
        </button>
        <span class="inset" v-else>
          (Registered)
        </span>
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
        {{ question.name }}
        <button
          v-if="!question.registered"
          @click="registerQuestion(question.name)">
          Register
        </button>
        <span class="inset" v-else>
          (Registered)
        </span>
      </li>
    </ul>
      
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import Courses, { NameSpacer } from '@/courses';
import { getDataShapes, getDoc, putDataShape, putQuestionType } from '@/db';
import * as _ from 'lodash';
import { Question } from '@/base-course/Course';
import { QuestionData, QuestionRecord } from '@/db/types';

interface DataShapeRegistrationStatus {
  name: string;
  dataShape: DataShape;
  registered: boolean;
}

interface QuestionRegistrationStatus {
  name: string;
  question: typeof Question;
  registered: boolean;
}

@Component({
  components: {
  }
})
export default class ComponentRegistration extends Vue {
  @Prop() public course: string;
  public dataShapes: DataShapeRegistrationStatus[] = [];
  public questions: QuestionRegistrationStatus[] = [];

  public created() {
    const dataShapeData = Courses.allDataShapes().filter((shape) => {
      return shape.course === this.course;
    });

    dataShapeData.forEach((shape) => {
      getDoc(NameSpacer.getDataShapeString(shape)).then((doc) => {
        this.dataShapes.push({
          name: shape.dataShape,
          dataShape: Courses.getDataShape(shape),
          registered: true
        });
      }).catch((err) => {
        this.dataShapes.push({
          name: shape.dataShape,
          dataShape: Courses.getDataShape(shape),
          registered: false
        });
      }).then(() => {
        this.dataShapes = _.sortBy(this.dataShapes, ['registered', 'name']);
      });
    });

    const questionData = Courses.getCourse(this.course)!.questions;

    questionData.forEach((question) => {
      getDoc<QuestionData>(NameSpacer.getQuestionString({
        course: this.course,
        questionType: question.name
      })).then((doc) => {
        this.questions.push({
          name: question.name,
          registered: true,
          question
        });
      }).catch((err) => {
        this.questions.push({
          name: question.name,
          registered: false,
          question
        });
      }).then(() => {
        this.questions = _.sortBy(this.questions, ['registered', 'name']);
      });
    });

  }

  private registerShape(shapeName: string) {
    const shape = this.dataShapes.find((findShape) => {
      return findShape.name === shapeName;
    })!;

    putDataShape(this.course, shape.dataShape).then((res) => {
      if (res.ok) {
        shape.registered = true;
      }
    });
  }
  private registerQuestion(questionName: string) {
    const question = this.questions.find((q) => {
      return q.name === questionName;
    })!;

    try {
      putQuestionType(this.course, question.question).then((res) => {
        if (res.ok) {
          question.registered = true;
        }
      });
    } catch (err) {
      alert(err);
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
