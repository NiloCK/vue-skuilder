import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Edit from './views/Edit.vue';
import Study from './views/Study.vue';
import Classrooms from './views/Classrooms.vue';
import Courses from './views/Courses.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      alias: [
        '/home'
      ],
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/edit',
      name: 'edit',
      component: Edit
    },
    {
      path: '/study',
      name: 'study',
      component: Study
    },
    {
      path: '/classrooms',
      name: 'classrooms',
      component: Classrooms
    },
    {
      path: '/courses',
      name: 'courses',
      component: Courses
    }
  ]
});