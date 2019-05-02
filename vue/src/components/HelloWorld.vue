<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <!-- <img src="@/assets/logo.png" alt="Vuetify.js" class="mb-5"> -->
        <!-- <blockquote>
          &#8220;First, solve the problem. Then, write the code.&#8221;
          <footer>
            <small>
              <em>&mdash;John Johnson</em>
            </small>
          </footer>
        </blockquote> -->
        <!-- <h1>Hi</h1> -->
        <h1 class='display-4'>
          <span class="font-weight-thin">edu</span>
          <span class="font-weight-bold">Quilted</span>          
        </h1>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script lang="ts">
import UserLogin from './UserLogin.vue';
import { Status } from '@/enums/Status';

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  components: {
    UserLogin
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
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


