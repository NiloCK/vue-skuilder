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
import { defineComponent, ref, onMounted, PropType } from 'vue';
import { Displayable } from '@/base-course/Displayable';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import Courses from '@/courses';
import { NameSpacer, QuestionDescriptor } from '@/courses/NameSpacer';
import { addNote55, getCredentialledCourseConfig } from '@/db/courseAPI';
import { updateCredentialledCourseConfig } from '@/db/courseDB';
import { CourseConfig, DataShape55, QuestionType55 } from '@/server/types';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import * as _ from 'lodash';
import { useStore } from 'vuex';

interface DataShapeRegistrationStatus {
  name: string;
  course: string;
  dataShape: DataShape;
  registered: boolean;
  displayable: typeof Displayable;
}

interface QuestionRegistrationStatus {
  name: string;
  course: string;
  question: typeof Displayable;
  registered: boolean;
}

export default defineComponent({
  name: 'ComponentRegistration',
  
  props: {
    course: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const { log } = SkldrComposable();
    const store = useStore();
    
    const dataShapes = ref<DataShapeRegistrationStatus[]>([]);
    const questions = ref<QuestionRegistrationStatus[]>([]);
    const courseDatashapes = ref<DataShape55[]>([]);
    const courseQuestionTypes = ref<QuestionType55[]>([]);
    const courseConfig = ref<CourseConfig | undefined>();

    const registerShape = async (shapeName: string) => {
      const shape = dataShapes.value.find(findShape => findShape.name === shapeName)!;

      courseConfig.value!.dataShapes.push({
        name: NameSpacer.getDataShapeString({
          dataShape: shape.name,
          course: shape.course,
        }),
        questionTypes: [],
      });

      const update = await updateCredentialledCourseConfig(props.course, courseConfig.value!);

      if (update.ok) {
        shape.registered = true;
      }
    };

    const registerQuestionView = async (questionName: string) => {
      const question = questions.value.find(q => q.name === questionName)!;

      const nsQuestionName = NameSpacer.getQuestionString({
        course: question.course,
        questionType: question.name,
      });

      courseConfig.value!.questionTypes.push({
        name: nsQuestionName,
        viewList: question.question.views.map(v => v.name),
        dataShapeList: question.question.dataShapes.map(d =>
          NameSpacer.getDataShapeString({
            course: question.course,
            dataShape: d.name,
          })
        ),
      });

      question.question.dataShapes.forEach(ds => {
        const nsDatashapeName = NameSpacer.getDataShapeString({
          course: question.course,
          dataShape: ds.name,
        });

        for (const db of courseConfig.value!.dataShapes) {
          if (db.name === nsDatashapeName) {
            db.questionTypes.push(nsQuestionName);
          }
        }
      });

      const update = await updateCredentialledCourseConfig(props.course, courseConfig.value!);

      if (update.ok) {
        question.registered = true;
        log(`Question: ${JSON.stringify(question)}\nCourseID: ${props.course}`);
        
        if (question.question.seedData) {
          log(`Question has seed data!`);
          question.question.seedData.forEach(d => {
            addNote55(
              props.course,
              question.course,
              question.question.dataShapes[0],
              d,
              store.state._user!.username,
              []
            );
          });
        } else {
          log(`Question has NO seed data!`);
        }
      }
    };

    onMounted(async () => {
      courseConfig.value = await getCredentialledCourseConfig(props.course);
      courseDatashapes.value = courseConfig.value.dataShapes;
      courseQuestionTypes.value = courseConfig.value.questionTypes;

      const dataShapeData = Courses.allDataShapes();
      Courses.allDataShapesRaw().forEach(ds => {
        log(`Datashape:\n${JSON.stringify(ds)}`);
      });

      dataShapeData.forEach(shape => {
        const index = courseDatashapes.value.find(test => {
          return test.name === NameSpacer.getDataShapeString(shape);
        });

        dataShapes.value.push({
          name: shape.dataShape,
          course: shape.course,
          dataShape: Courses.getDataShape(shape),
          registered: index !== undefined,
          displayable: shape.displayable,
        });
      });

      dataShapes.value = _.sortBy(dataShapes.value, ['registered', 'name']);

      const courseNameList = Courses.courses.map(course => course.name);
      const questionData: Array<[QuestionDescriptor, typeof Displayable]> = [];

      courseNameList.forEach(course => {
        const courseQs = Courses.getCourse(course)!.questions;
        courseQs.forEach(courseQ => {
          questionData.push([
            { course, questionType: courseQ.name },
            courseQ,
          ]);
        });
      });

      questionData.forEach(question => {
        const index = courseQuestionTypes.value.find(test => {
          return NameSpacer.getQuestionString(question[0]) === test.name;
        });

        questions.value.push({
          course: question[0].course,
          name: question[1].name,
          registered: index !== undefined,
          question: question[1],
        });
      });
    });

    return {
      dataShapes,
      questions,
      registerShape,
      registerQuestionView
    };
  }
});
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
