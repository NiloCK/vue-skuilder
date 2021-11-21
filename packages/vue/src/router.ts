import MarkdownRenderer from '@/base-course/Components/MarkdownRenderer.vue';
import Vue from 'vue';
import Router from 'vue-router';
import ClassroomCtrlPanel from './components/Classrooms/ClassroomCtrlPanel.vue';
import JoinCode from './components/Classrooms/JoinCode.vue';
import CourseRouter from './components/Courses/CourseRouter.vue';
import ELOModerator from './components/Courses/EloModeration.vue';
import TagInformation from './components/Courses/TagInformation.vue';
import CourseEditor from './components/Edit/CourseEditor.vue';
import Stats from './components/User/Stats.vue';
import About from './views/About.vue';
import Admin from './views/Admin.vue';
import Classrooms from './views/Classrooms.vue';
import Courses from './views/Courses.vue';
import Edit from './views/Edit.vue';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import ReleaseNotes from './views/ReleaseNotes.vue';
import SignUp from './views/SignUp.vue';
import Study from './views/Study.vue';
import User from './views/User.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/md',
      component: MarkdownRenderer,
    },
    {
      path: '/',
      alias: ['/home'],
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp,
    },
    {
      path: '/edit',
      name: 'edit',
      component: Edit,
    },
    {
      path: '/notes',
      component: ReleaseNotes,
    },
    {
      path: '/edit/:course',
      props: true,
      component: CourseEditor,
    },
    {
      path: '/study',
      name: 'study',
      component: Study,
    },
    {
      path: '/study/:focusCourseID',
      component: Study,
      props: true,
    },
    {
      path: '/random',
      name: 'random',
      alias: ['/r'],
      props: {
        randomPreview: true,
      },
      component: Study,
    },
    {
      path: '/classrooms',
      name: 'classrooms',
      component: Classrooms,
    },
    {
      path: '/classrooms/:_id',
      props: true,
      alias: '/c/:_id',
      component: ClassroomCtrlPanel,
    },
    {
      path: '/classrooms/:_id/code',
      props: true,
      alias: '/c/:_id',
      component: JoinCode,
    },
    {
      path: '/courses',
      alias: ['/quilts', '/q'],
      component: Courses,
    },
    {
      path: '/courses/:query',
      props: true,
      alias: ['/quilts/:query', '/q/:query'],
      component: CourseRouter,
    },
    {
      path: '/courses/:_id/elo',
      props: true,
      alias: ['/quilts/:_id/elo', '/q/:_id/elo'],
      component: ELOModerator,
    },
    {
      path: '/courses/:_courseId/tags/:_id',
      props: true,
      alias: ['/quilts/:_courseId/tags/:_id', '/q/:_courseId/tags/:_id'],
      component: TagInformation,
    },
    {
      path: '/courses/:previewCourseID/preview',
      props: true,
      alias: ['/quilts/:previewCourseID/preview', '/q/:previewCourseID/preview'],
      component: Study,
    },
    {
      path: '/admin',
      component: Admin,
    },
    {
      path: '/user/:_id',
      alias: '/u/:_id',
      props: true,
      component: User,
      children: [
        {
          path: 'new',
          component: User,
        }, //,
        // {
        //   path: '/stats',
        //   component: Stats,
        // },
      ],
    },
    {
      path: '/user/:_id/stats',
      props: true,
      alias: ['/u/:_id/stats'],
      component: Stats,
    },
  ],
});
