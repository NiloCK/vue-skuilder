import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Edit from './views/Edit.vue';
import CourseEditor from './components/Edit/CourseEditor.vue';
import Study from './views/Study.vue';
import Classrooms from './views/Classrooms.vue';
import ClassroomCtrlPanel from './components/Classrooms/ClassroomCtrlPanel.vue';
import Courses from './views/Courses.vue';
import CourseInformation from './components/Courses/CourseInformation.vue';
import Admin from './views/Admin.vue';
import User from './views/User.vue';
import ReleaseNotes from './views/ReleaseNotes.vue';

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
      path: '/notes',
      component: ReleaseNotes
    },
    {
      path: '/edit/:course',
      props: true,
      component: CourseEditor
    },
    {
      path: '/study',
      name: 'study',
      component: Study,
    },
    {
      path: '/study/:focusCourseID',
      component: Study,
      props: true
    },
    {
      path: '/random',
      name: 'random',
      alias: [
        '/r'
      ],
      props: {
        randomPreview: true,
      },
      component: Study,
    },
    {
      path: '/classrooms',
      name: 'classrooms',
      component: Classrooms
    },
    {
      path: '/classrooms/:_id',
      props: true,
      alias: '/c/:_id',
      component: ClassroomCtrlPanel
    },
    {
      path: '/courses',
      alias: ['/quilts', '/q'],
      component: Courses
    },
    {
      path: '/courses/:_id',
      props: true,
      alias: ['/quilts/:_id', '/q/:_id'],
      component: CourseInformation,
    },
    {
      path: '/courses/:previewCourseID/preview',
      props: true,
      alias: ['/quilts/:previewCourseID/preview', '/q/:previewCourseID/preview'],
      component: Study,
    },
    {
      path: '/admin',
      component: Admin
    },
    {
      path: '/user/:_id',
      alias: '/u/:_id',
      props: true,
      component: User
    }
  ]
});
