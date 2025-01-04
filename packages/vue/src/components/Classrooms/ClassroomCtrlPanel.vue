<template>
  <div v-if="!updatePending">
    <h1><router-link to="/classrooms">My Classrooms</router-link> / {{ _classroomCfg.name }}</h1>

    <h3>
      Join code: {{ _classroomCfg.joinCode }}
      <router-link :to="`/classrooms/${_id}/code`">
        <v-btn small dark icon color="accent" alt="Make Fullscreen">
          <v-icon>fullscreen</v-icon>
        </v-btn>
      </router-link>
    </h3>
    <v-layout wrap column>
      <v-flex xs12 sm6 md4>
        <v-checkbox label="Allow peer instruction" v-model="_classroomCfg.peerAssist" :value="true"></v-checkbox>
      </v-flex>
      <div v-if="classroomDB.ready">
        <h2>Assigned Content:</h2>
        <h3>Quilts:</h3>
        <ul></ul>
        <ul>
          <li v-for="c in _assignedCourses" :key="c.courseID">
            {{ c.courseID }} <a @click="removeContent(c)">Remove</a>
          </li>
        </ul>
        <h3>Tags:</h3>
        <ul>
          <li v-for="(c, i) in _assignedTags" :key="i">
            {{ c.courseID }} - {{ c.tagID }} <a @click="removeContent(c)">Remove</a>
          </li>
        </ul>
        <v-btn transition="scale-transition" v-if="!addingContent" color="primary" @click="addingContent = true">
          Assign New Content
          <v-icon right dark>add</v-icon>
        </v-btn>
        <v-card v-if="addingContent">
          <v-toolbar>
            <v-toolbar-title>Add Content</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn @click="addingContent = false" right small dark icon color="error">
              <v-icon>close</v-icon>
            </v-btn>
          </v-toolbar>
          <v-card-text>
            <v-select
              label="Select Quilt"
              :items="availableCourses"
              v-model="selectedCourse"
              autocomplete
              item-text="name"
              item-value="_id"
              title="Select Quilt"
            ></v-select>

            <v-select
              label="Select Tags"
              :items="availableTags"
              item-text="name"
              item-value="name"
              v-model="selectedTags"
              multiple
              chips
              hint=""
              persistent-hint
            ></v-select>
          </v-card-text>

          <v-card-actions>
            <v-btn v-if="selectedCourse !== ''" color="primary" @click="assignContent">
              {{ selectedTags.length == 0 ? 'Add Entire Quilt' : 'Add Tags' }}
              <v-icon flat right dark>add</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-layout>
  </div>
</template>

<script lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import moment from 'moment';
import TeacherClassroomDB, { AssignedContent, AssignedTag } from '@/db/classroomDB';
import { getCourseList, getCourseTagStubs } from '@/db/courseDB';
import { Tag } from '@/db/types';
import { ClassroomConfig, CourseConfig } from '@/server/types';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import { useStore } from 'vuex';

const props = defineProps<{
  _id: string;
}>();

const { log } = SkldrComposable();
const store = useStore();

const classroomDB = ref<TeacherClassroomDB>();
const _classroomCfg = ref<ClassroomConfig>();
const _assignedContent = ref<AssignedContent[]>([]);

const _assignedCourses = computed(() => 
  _assignedContent.value.filter(c => c.type === 'course')
);

const _assignedTags = computed(() => 
  _assignedContent.value.filter(c => c.type === 'tag') as AssignedTag[]
);

const nameRules = [
  (value: string) => {
    const max = 30;
    return value.length <= max || `Course name must be ${max} characters or less`;
  },
];

const updatePending = ref(true);
const addingContent = ref(false);
const availableCourses = ref<CourseConfig[]>([]);
const selectedCourse = ref('');
const availableTags = ref<Tag[]>([]);
const selectedTags = ref<string[]>([]);

onMounted(async () => {
  classroomDB.value = await TeacherClassroomDB.factory(props._id);
  
  const [content, config] = await Promise.all([
    classroomDB.value.getAssignedContent(),
    classroomDB.value.getConfig()
  ]);
  
  _assignedContent.value = content;
  _classroomCfg.value = config;

  log(`Route loaded w/ (prop) _id: ${props._id}`);
  log(`Config: ${JSON.stringify(_classroomCfg.value)}`);

  const courseList = await getCourseList();
  availableCourses.value = courseList.rows.map(r => r.doc!);

  updatePending.value = false;
});

watch(selectedCourse, async (newVal) => {
  if (newVal) {
    const tags = await getCourseTagStubs(newVal);
    availableTags.value = tags.rows.map(row => row.doc!);
  }
});

async function assignContent() {
  if (!classroomDB.value) return;

  if (selectedTags.value.length === 0) {
    await classroomDB.value.assignContent({
      assignedOn: moment(),
      activeOn: moment(),
      type: 'course',
      courseID: selectedCourse.value,
      assignedBy: store.state._user!.username,
    });
  } else {
    await Promise.all(selectedTags.value.map(tag => 
      classroomDB.value!.assignContent({
        assignedOn: moment(),
        activeOn: moment(),
        type: 'tag',
        courseID: selectedCourse.value,
        tagID: tag,
        assignedBy: store.state._user!.username,
      })
    ));
  }

  _assignedContent.value = await classroomDB.value.getAssignedContent();
  addingContent.value = false;
  selectedCourse.value = '';
  selectedTags.value = [];
  availableTags.value = [];
}

async function removeContent(c: AssignedContent) {
  if (classroomDB.value) {
    await classroomDB.value.removeContent(c);
  }
}

function submit() {
  updatePending.value = true;
}
</script>
