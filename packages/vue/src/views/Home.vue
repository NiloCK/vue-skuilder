<template>
  <v-container fluid fill-height>
    <v-layout row align-center>
      <v-flex>
        <h1 :class="{ 'display-3': $vuetify.breakpoint.xs, 'display-4': $vuetify.breakpoint.smAndUp }">
          <span class="font-weight-thin">edu</span>
          <span class="font-weight-bold">Quilt</span>
        </h1>
        <!-- {interactive|adaptive|personalized} courseware that {everyone|anyone|you|grandma|grandpa} can {edit|improve|write} -->
        <p class="headline">
          <em>quilt</em>: (n) a <text-swap ref="swap1" :text="label" /> of
          <text-swap ref="swap2" :text="adjective" /> courseware that <text-swap ref="swap3" :text="subject" /> can
          <text-swap ref="swap4" :text="verb" />
        </p>
        <br /><br /><br />
        <div class="subheading">(get cozy)</div>
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
import TextSwap from '@/components/TextSwap.vue';
import { Status } from '@/enums/Status';
import Vue from 'vue';

interface Data {
  swapIntervalID: number | null;
  label: string[];
  adjective: string[];
  subject: string[];
  verb: string[];
}

export default Vue.extend({
  name: 'Home',

  components: {
    UserLogin,
    TextSwap,
  },

  data(): Data {
    return {
      swapIntervalID: null,
      label: ['collection', 'patchwork', 'network', 'jumble'],
      adjective: ['interactive', 'adaptive', 'interlinked', 'intelligent'],
      subject: ['anyone', 'everyone', 'you'],
      verb: ['edit', 'start', 'study', 'improve'],
    };
  },

  computed: {
    swaps(): TextSwap[] {
      return [
        this.$refs.swap1 as TextSwap,
        this.$refs.swap2 as TextSwap,
        this.$refs.swap3 as TextSwap,
        this.$refs.swap4 as TextSwap,
      ];
    },
  },

  created() {
    this.swapIntervalID = window.setInterval(this.randomSwap, 7000);
  },

  beforeDestroy() {
    if (this.swapIntervalID !== null) {
      clearInterval(this.swapIntervalID);
      this.swapIntervalID = null;
    }
  },

  methods: {
    randomSwap(): void {
      this.swaps.forEach((s) => {
        if (Math.random() < 0.33) s.next();
      });
    },
  },
});
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
