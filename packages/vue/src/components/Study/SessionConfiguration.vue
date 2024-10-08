<template>
  <div v-if="hasRegistrations">
    <div class="display-1">Select your quilts</div>
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
      class="flex xs12 sm6 md4 lg3 headline"
      solo
      prepend-inner-icon="access_time"
      prepend-icon="remove"
      append-outer-icon="add"
      :suffix="timeLimit > 1 ? '(minutes)' : '(minute)'"
      hint="Time Limit for this Session"
      ref="numberField"
      v-model="timeLimit"
      mask="##"
      type="number"
      @click:prepend="timeLimit--"
      @click:append-outer="timeLimit++"
    />
    <v-btn class="flex" color="success" @click="startSession">Start Studying!</v-btn>
  </div>
  <div v-else class="display-1">
    <p>You don't have anything to study!</p>
    <p>Head over to the <router-link to="/quilts">Quilts</router-link> page to find something for you.</p>
  </div>
</template>

<script lang="ts">
import { CourseRegistration, CourseRegistrationDoc, User } from '@/db/userDB';
import { CourseDB, getCourseName } from '@/db/courseDB';
import SkldrVue from '@/SkldrVue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import SkldrMouseTrap from '@/SkldrMouseTrap';
import { StudentClassroomDB } from '@/db/classroomDB';
import { ContentSourceID } from '@/db/contentSource';

interface SessionConfigMetaData {
  selected: boolean;
  name: string;
  reviews: number;
}

@Component({})
export default class SessionConfiguration extends SkldrVue {
  public allSelected: boolean = true;
  public activeCourses: (CourseRegistration & SessionConfigMetaData)[] = [];
  public activeClasses: ({ classID: string } & SessionConfigMetaData)[] = [];
  private timeLimit: number = this.$store.state.views.study.sessionTimeLimit;

  private hasRegistrations: boolean = true;

  @Watch('cardCount')
  @Watch('timeLimit')
  private rangeCheck() {
    if (this.timeLimit <= 0) {
      this.timeLimit = 1;
    }

    this.$store.state.views.study.sessionTimeLimit = this.timeLimit;
  }

  public $refs: {
    numberField: HTMLInputElement;
    selectAll: HTMLInputElement;
  };

  @Prop({
    required: true,
  })
  public startFcn: (sources: ContentSourceID[]) => void;

  private update() {
    this.log(JSON.stringify(this.activeCourses));
    this.log(JSON.stringify(this.activeClasses));
  }

  private toggleAll(): void {
    this.log(`Toggling all courses`);

    this.activeCourses.forEach(crs => {
      crs.selected = this.allSelected;
    });
    this.activeClasses.forEach(cl => {
      cl.selected = this.allSelected;
    });

    this.log(JSON.stringify(this.activeCourses));
  }

  private startSession() {
    SkldrMouseTrap.reset();
    const selectedCourses: ContentSourceID[] = this.activeCourses
      .filter(c => c.selected)
      .map(c => {
        return { type: 'course', id: c.courseID };
      });
    const selectedClassrooms: ContentSourceID[] = this.activeClasses
      .filter(cl => cl.selected)
      .map(cl => {
        return { type: 'classroom', id: cl.classID };
      });

    this.startFcn(selectedCourses.concat(selectedClassrooms));
    // + classroom sources
  }

  public async created() {
    this.setHotkeys();
    await Promise.all([this.getActiveCourses(), this.getActiveClassrooms()]);

    if (this.activeCourses.length === 0 && this.activeClasses.length === 0) {
      this.hasRegistrations = false;
    }
  }

  private async getActiveClassrooms() {
    const classes = await (await User.instance()).getActiveClasses();
    const activeClasses: ({ classID: string } & SessionConfigMetaData)[] = [];

    this.log(`Active classes: ${JSON.stringify(classes)}`);

    await Promise.all(
      classes.map(c =>
        (async (classID: string) => {
          const classDb = await StudentClassroomDB.factory(classID);
          activeClasses.push({
            classID,
            name: classDb.getConfig().name,
            selected: true,
            reviews: 0,
          });
        })(c)
      )
    );
    this.activeClasses = activeClasses;
  }

  private async getActiveCourses() {
    this.activeCourses = (await this.$store.state._user!.getActiveCourses()).map(c => {
      return {
        ...c,
        selected: true,
        name: '',
        reviews: 0,
      };
    });

    Promise.all(
      this.activeCourses.map((c, i) =>
        (async (courseID: string) => {
          return Promise.all([
            (this.activeCourses[i].name = await getCourseName(c.courseID)),
            (this.activeCourses[i].reviews = await (await User.instance()).getScheduledReviewCount(c.courseID)),
          ]);
        })(c.courseID)
      )
    );
  }

  private setHotkeys() {
    SkldrMouseTrap.reset();
    SkldrMouseTrap.bind([
      {
        hotkey: 'up',
        callback: () => {
          this.timeLimit++;
        },
        command: '',
      },
      {
        hotkey: 'down',
        callback: () => {
          this.timeLimit--;
        },
        command: '',
      },
      {
        hotkey: 'enter',
        callback: this.startSession,
        command: '',
      },
    ]);
  }

  public destroyed() {
    SkldrMouseTrap.reset();
  }

  public async mounted() {
    document.getElementById('SelectAll')!.focus();
  }
}
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
