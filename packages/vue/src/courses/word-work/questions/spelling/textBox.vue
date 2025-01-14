<template>
  <div data-viewable="IdentifyVocab">
    <template v-if="question">
      <span class="headline"> Spell the word: </span>
      <UserInputString v-model="answer" />
      <center>
        <span v-if="questionUtils.priorAttempts" class="title">
          {{ question.word }}
        </span>
      </center>
      <center>
        <audio-auto-player :src="[getURL('WordAudio'), getURL('SentenceAudio'), getURL('WordAudio')]" />
      </center>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';
import { SpellingQuestion } from '@/courses/word-work/questions/spelling';
import { useViewable, useQuestionView } from '@/base-course/CompositionViewable';
import { ViewData } from '@/base-course/Interfaces/ViewData';
import AudioAutoPlayer from '@/base-course/Components/AudioAutoPlayer.vue';
import UserInputString from '@/base-course/Components/UserInput/UserInputString.vue';

export default defineComponent({
  name: 'IdentifyVocab',

  components: {
    AudioAutoPlayer,
    UserInputString,
  },

  props: {
    data: {
      type: Array as PropType<ViewData[]>,
      required: true,
    },
    modifyDifficulty: {
      type: Number,
      required: false,
    },
  },

  setup(props, { emit }) {
    const viewableUtils = useViewable(props, emit, 'IdentifyVocab');
    const questionUtils = useQuestionView<SpellingQuestion>(viewableUtils, props.modifyDifficulty);

    const answer = ref('');

    // Initialize question immediately
    questionUtils.question.value = new SpellingQuestion(props.data);

    // Expose the question directly for template access
    const question = computed(() => questionUtils.question.value);

    const submit = () => {
      if (question.value) {
        const isCorrect = question.value.isCorrect(answer.value);
        questionUtils.submitAnswer(answer.value);
      }
    };

    return {
      ...viewableUtils,
      ...questionUtils,
      answer,
      question,
      submit,
    };
  },
});
</script>
