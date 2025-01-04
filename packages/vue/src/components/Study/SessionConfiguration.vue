<template>
  <div v-if="hasRegistrations">
    <div class="text-h4">Select your quilts</div>
    <table width="100%">
      <th>
        <v-checkbox
          ref="selectAll"
          id="SelectAll"
          autofocus
          label="Select All"
          @change="toggleAll"
          v-model="allSelected"
        ></v-checkbox>
      </th>

      <th>
        Reviews
        <!-- <v-icon>info</v-icon> -->
      </th>

      <tr v-for="classroom in activeClasses" :key="classroom.classID">
        <td>
          <v-checkbox :label="`Class: ${classroom.name}`" @click.capture="update" v-model="classroom.selected" />
        </td>
        <td>-</td>
      </tr>
      <tr v-for="course in activeCourses" :key="course.courseID">
        <td>
          <v-checkbox :label="`q/${course.name}`" @click.capture="update" v-model="course.selected" />
        </td>
        <td>{{ course.reviews }}</td>
      </tr>
    </table>
    <!-- <v-text-field
      label="Card Limit for this Session"
      hint="Study as much or as little as you like by adjusting this"
      type="number"
      ref="numberField"
      v-model="cardCount"
    /> -->
    <v-text-field
      class="col-12 col-sm-6 col-md-4 col-lg-3 text-h5"
      solo
      prepend-inner-icon="mdi-clock-outline"
      prepend-icon="mdi-minus"
      append-outer-icon="mdi-plus"
      :suffix="timeLimit > 1 ? '(minutes)' : '(minute)'"
      hint="Time Limit for this Session"
      ref="numberField"
      v-model="timeLimit"
      mask="##"
      type="number"
      @click:prepend="timeLimit--"
      @click:append-outer="timeLimit++"
    />
    <v-btn color="success" @click="startSession">Start Studying!</v-btn>
  </div>
  <div v-else class="text-h4">
    <p>You don't have anything to study!</p>
    <p>Head over to the <router-link to="/quilts">Quilts</router-link> page to find something for you.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch, PropType } from 'vue';
import { CourseRegistration, User } from '@/db/userDB';
import { getCourseName } from '@/db/courseDB';
import { StudentClassroomDB } from '@/db/classroomDB';
import { ContentSourceID } from '@/db/contentSource';
import SkldrMouseTrap from '@/SkldrMouseTrap';
import { useStore } from 'vuex';
import { SkldrComposable } from '@/mixins/SkldrComposable';

interface SessionConfigMetaData {
  selected: boolean;
  name: string;
  reviews: number;
}

export default defineComponent({
  name: 'SessionConfiguration',
  
  props: {
    startFcn: {
      type: Function as PropType<(sources: ContentSourceID[]) => void>,
      required: true
    }
  },

  setup(props) {
    const store = useStore();
    const { log } = SkldrComposable();
    
    const allSelected = ref(true);
    const activeCourses = ref<(CourseRegistration & SessionConfigMetaData)[]>([]);
    const activeClasses = ref<({ classID: string } & SessionConfigMetaData)[]>([]);
    const timeLimit = ref(store.state.views.study.sessionTimeLimit);
    const hasRegistrations = ref(true);

    watch(timeLimit, (newVal) => {
      if (newVal <= 0) {
        timeLimit.value = 1;
      }
      store.state.views.study.sessionTimeLimit = timeLimit.value;
    });

    const update = () => {
      log(JSON.stringify(activeCourses.value));
      log(JSON.stringify(activeClasses.value));
    };

    const toggleAll = () => {
      log(`Toggling all courses`);
      activeCourses.value.forEach((crs) => {
        crs.selected = allSelected.value;
      });
      activeClasses.value.forEach((cl) => {
        cl.selected = allSelected.value;
      });
      log(JSON.stringify(activeCourses.value));
    };

    const startSession = () => {
      SkldrMouseTrap.reset();
      const selectedCourses: ContentSourceID[] = activeCourses.value
        .filter((c) => c.selected)
        .map((c) => ({ type: 'course', id: c.courseID }));
      const selectedClassrooms: ContentSourceID[] = activeClasses.value
        .filter((cl) => cl.selected)
        .map((cl) => ({ type: 'classroom', id: cl.classID }));

      props.startFcn(selectedCourses.concat(selectedClassrooms));
    };

    const getActiveClassrooms = async () => {
      const classes = await (await User.instance()).getActiveClasses();
      const tempActiveClasses: ({ classID: string } & SessionConfigMetaData)[] = [];

      log(`Active classes: ${JSON.stringify(classes)}`);

      await Promise.all(
        classes.map((c) =>
          (async (classID: string) => {
            const classDb = await StudentClassroomDB.factory(classID);
            tempActiveClasses.push({
              classID,
              name: classDb.getConfig().name,
              selected: true,
              reviews: 0,
            });
          })(c)
        )
      );
      activeClasses.value = tempActiveClasses;
    };

    const getActiveCourses = async () => {
      activeCourses.value = (await store.state._user!.getActiveCourses()).map((c) => ({
        ...c,
        selected: true,
        name: '',
        reviews: 0,
      }));

      await Promise.all(
        activeCourses.value.map((c, i) =>
          (async () => {
            activeCourses.value[i].name = await getCourseName(c.courseID);
            activeCourses.value[i].reviews = await (await User.instance()).getScheduledReviewCount(c.courseID);
          })()
        )
      );
    };

    const setHotkeys = () => {
      SkldrMouseTrap.reset();
      SkldrMouseTrap.bind([
        {
          hotkey: 'up',
          callback: () => { timeLimit.value++; },
          command: '',
        },
        {
          hotkey: 'down',
          callback: () => { timeLimit.value--; },
          command: '',
        },
        {
          hotkey: 'enter',
          callback: startSession,
          command: '',
        },
      ]);
    };

    onMounted(async () => {
      document.getElementById('SelectAll')?.focus();
      setHotkeys();
      await Promise.all([getActiveCourses(), getActiveClassrooms()]);
      if (activeCourses.value.length === 0 && activeClasses.value.length === 0) {
        hasRegistrations.value = false;
      }
    });

    onBeforeUnmount(() => {
      SkldrMouseTrap.reset();
    });

    return {
      allSelected,
      activeCourses,
      activeClasses,
      timeLimit,
      hasRegistrations,
      update,
      toggleAll,
      startSession
    };
  }
});
</script>

<style scoped>
td {
  text-align: center;
  align-content: center;
}

.cb {
  align-content: center !important;
  text-align: center !important;
}
</style>
