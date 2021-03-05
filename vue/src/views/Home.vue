<template>
  <v-container fluid fill-height>
    <v-layout row align-center>
      <v-flex>
        <h1 :class="{ 'display-3': $vuetify.breakpoint.xs, 'display-4': $vuetify.breakpoint.smAndUp }">
          <span class="font-weight-thin">edu</span>
          <span class="font-weight-bold">Quilt</span>
        </h1>
        <div class="display-1">An experiment in community-driven learning and teaching</div>
        <br /><br /><br />
        <div class="headline">(get cozy)</div>
      </v-flex>
      <!-- <div class="section"></div> -->
      <!-- <div class="section step1">
          
          <ul class="headline">
            <li>Somebody starts a new Quilt</li>
            <li>Anybody can add content or make connections between content</li>
            <li>Suggested content and connections are tested with students.
              Effective, engaging content shines through. The rest falls out of use.</li>
          </ul>
        </div>
        <div class="section step2">
          Hi
        </div>
         -->
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import UserLogin from '../components/UserLogin.vue';
import { Status } from '@/enums/Status';
import SkldrVue from '../SkldrVue';
import { Prop, Component } from 'vue-property-decorator';

@Component({
  components: {
    UserLogin,
  },
})
export default class Home extends SkldrVue {}
</script>

<style scoped>
.section:first {
  padding: 0px 0px 0px 0px;
}
.pitch {
  padding: 50px 0px 0px 0px;
}
.section {
  width: 100%;
  transform: skewY(-4deg) !important;
  padding: 200px 0px;
  margin: 0px 0px;
  background-color: transparent;
}
.section > * {
  transform: skewY(4deg);
}

.step1 {
  background-color: skyblue;
}

.step2 {
  background-color: red;
}

.eduFade {
  animation: fadein 2s;
}

.quiltedFade {
  /* margin-top: 25px; */
  /* font-size: 21px; */
  /* text-align: center; */

  animation: delayfadein 2s ease-in-out;
}

@keyframes delayfadein {
  0% {
    opacity: 0;
  }
  33% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
