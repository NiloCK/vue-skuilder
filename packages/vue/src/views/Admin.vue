<template>
  <div>
    <h1>{{ title }}</h1>
    <div>
      <h3>Users - {{ registeredUsers.length }}</h3>
      <ul>
        <li v-for="u in registeredUsers" :key="u._id">User: {{ u.name }}</li>
      </ul>
    </div>
    <div>
      <h3><router-link to="/courses"> Quilts </router-link> - {{ courses.length }}</h3>
      <ul>
        <li v-for="c in courses" :key="c._id">
          <router-link :to="`/q/${c._id}`">{{ c.name }}</router-link>
          - {{ c._id }} - <a @click="removeCourse(c._id)">X</a>
        </li>
      </ul>
    </div>
    <div>
      <h3>Classrooms - {{ classrooms.length }}</h3>
      <ul>
        <li v-for="c in classrooms" :key="c._id">
          <router-link :to="`/c/${c._id}`">{{ c.name }}</router-link>
          {{ c.name }} - {{ c.teachers }} - {{ c.students.length }} students
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import { log } from 'util';
import SkldrVue from '../SkldrVue';
import AdminDB from '../db/adminDB';
import { GuestUsername } from '../store';

@Component({})
export default class Admin extends SkldrVue {
  public title: string = 'Admin Panel';

  public db: AdminDB;
  public users: any[] = [];
  public courses: any[] = [];
  public classrooms: any[] = [];

  public get registeredUsers(): any[] {
    return this.users.filter((u) => {
      return !(u.name as string).startsWith(GuestUsername);
    });
  }

  public async created() {
    try {
      this.db = await AdminDB.factory();
      this.users = await this.db.getUsers();
      this.courses = await this.db.getCourses();
      this.classrooms = await this.db.getClassrooms();
    } catch (e) {
      this.title = 'This page is for database admins only.';
      throw `${JSON.stringify(e)} - ${e}\n\nNot an admin!`;
    }
  }

  public removeCourse(id: string) {
    console.log(`Removing ${id}`);
    this.db.removeCourse(id);
  }
}
</script>

<style scoped></style>
