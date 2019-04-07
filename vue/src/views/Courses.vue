<template>
  <v-container fluid>

  <v-layout row justify-space-around="">
    <v-flex >
      <v-card>
        <v-toolbar >
          <v-toolbar-title>My Registered Courses</v-toolbar-title>
        </v-toolbar>

        <v-list >
          <template v-for="course in registeredCourses">
            
            <v-list-tile
              :key="course"
              avatar
              @click="log('asof')"
            >

              <v-list-tile-content>
                <v-list-tile-title v-html="course"></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-card>

      
    </v-flex>
    <v-spacer></v-spacer>
    <v-flex>
      <v-card>
        <v-toolbar >
          <v-toolbar-title>Available Courses</v-toolbar-title>
        </v-toolbar>

        <v-list >
          <template v-for="course in availableCourses">
            
            <v-list-tile
              :key="course"
              avatar
            >

              <v-list-tile-content>
                <v-list-tile-title v-html="course"></v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn 
                 small
                 color="primary"
                 @click="addCourse(course)"
                >
                  Register
                </v-btn>
              </v-list-tile-action>
              
            </v-list-tile>
          </template>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import CourseEditor from '../components/Edit/CourseEditor.vue';
import { Component } from 'vue-property-decorator';
import CourseList from '../courses';
import _ from 'lodash';
import { log } from 'util';

@Component({
  components: {
    CourseEditor
  }
})
export default class Courses extends Vue {
  public existingCourses: string[] = [];
  public registeredCourses: string[] = ['sample', 'course', 'data'];
  public get availableCourses() {
    return _.without(this.existingCourses, ...this.registeredCourses);
  }

  private created() {
    this.existingCourses = CourseList.courses.map((course) => {
      return course.name;
    });
  }
  private addCourse(course: string) {
    log(`Attempting to register for ${course}`);
  }
}
</script>
