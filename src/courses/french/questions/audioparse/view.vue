<template>
  <div>
      <!-- <audio autoplay :src="getURL('audio')" /> -->
      <AudioAutoPlayer :src="getURL('audio')" />
      <br><br>
      {{ question.text }}
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import { AudioParsingQuestion } from './index';
import AudioAutoPlayer from '@/base-course/Components/AudioAutoPlayer.vue';

@Component({
    components: {
        AudioAutoPlayer
    }
})
export default class AudioParseView extends QuestionView<AudioParsingQuestion> {
    public answer: string = '';
    get question() {
        return new AudioParsingQuestion(this.data);
    }



    public submit() {
        // alert(this.question.isCorrect(parseInt(this.answer, 10)));
    }
}
</script>
