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
import { defineComponent } from 'vue';
import { log } from 'util';
import AdminDB from '../db/adminDB';
import { GuestUsername } from '../store';

export default defineComponent({
  name: 'Admin',

  data() {
    return {
      title: 'Admin Panel',
      db: null as AdminDB | null,
      users: [] as any[],
      courses: [] as any[],
      classrooms: [] as any[]
    };
  },

  computed: {
    registeredUsers(): any[] {
      return this.users.filter((u) => {
        return !(u.name as string).startsWith(GuestUsername);
      });
    }
  },

  async created() {
    try {
      this.db = await AdminDB.factory();
      this.users = await this.db.getUsers();
      this.courses = await this.db.getCourses();
      this.classrooms = await this.db.getClassrooms();
    } catch (e) {
      this.title = 'This page is for database admins only.';
      throw `${JSON.stringify(e)} - ${e}\n\nNot an admin!`;
    }
  },

  methods: {
    removeCourse(id: string): void {
      console.log(`Removing ${id}`);
      if (this.db) {
        this.db.removeCourse(id);
      }
    }
  }
});
</script>

<style scoped></style>
