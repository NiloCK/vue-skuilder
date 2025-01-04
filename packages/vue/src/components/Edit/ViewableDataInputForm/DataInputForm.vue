<template>
  <v-container fluid>
    <v-layout row wrap>
      <v-flex xl6>
        <v-form ma-2 autocomplete="off">
          <div
            ref="fieldInputWraps"
            v-for="(field, i) in dataShape.fields"
            v-bind:key="dataShape.fields.indexOf(field)"
          >
            <string-input
              v-if="field.type === ftString"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <chess-puzzle-input
              v-else-if="field.type === chessPuzzle"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <number-input
              v-else-if="field.type === num"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <integer-input
              v-else-if="field.type === int"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <image-input
              v-else-if="field.type === img"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <markdown-input
              v-else-if="field.type === mkd"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <audio-input
              v-else-if="field.type === audio"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <midi-input
              v-else-if="field.type === midi"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
            <media-drag-drop-uploader
              v-else-if="field.type === uploader"
              v-bind:store="store"
              v-bind:field="field"
              v-bind:uiValidationFunction="checkInput"
              v-bind:autofocus="i == 0"
            />
          </div>

          <tags-input hideSubmit="true" ref="tagsInput" v-bind:courseID="courseCfg.courseID" cardID="" />
          <v-btn
            right
            type="submit"
            color="primary"
            v-bind:loading="uploading"
            v-bind:disabled="!allowSubmit"
            v-on:click.native.prevent="submit"
          >
            Add card
            <v-icon right dark>add_circle</v-icon>
          </v-btn>
        </v-form>
      </v-flex>
      <v-flex xl6>
        <card-browser class="ml-4" v-if="inputIsValidated" v-bind:views="shapeViews" v-bind:data="[previewInput]" />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { SkldrComposable } from '@/mixins/SkldrComposable';
import { NameSpacer, ShapeDescriptor } from '@/courses/NameSpacer';
import { addNote55 } from '@/db/courseAPI'; 
import { getCourseTagStubs } from '@/db/courseDB';
import { fieldConverters, FieldType } from '@/enums/FieldType';
import { Status } from '@/enums/Status';
import ENV from '@/ENVIRONMENT_VARS';
import { CourseConfig } from '@/server/types';
import Courses from '@/courses';
import FillInView from '@/courses/default/questions/fillIn/fillIn.vue';
import { alertUser } from '@/components/SnackbarService.vue';
import _ from 'lodash';
import { useStore } from 'vuex';
import type { FieldInput } from '@/components/Edit/ViewableDataInputForm/FieldInput';
import type { CourseElo } from '@/tutor/Elo';

export default defineComponent({
  name: 'DataInputForm',
  
  components: {
    AudioInput,
    NumberInput,
    StringInput,
    IntegerInput,
    ImageInput,
    MarkdownInput,
    MidiInput,
    CardBrowser,
    DataShapeTable,
    MediaUploader,
    MediaDragDropUploader,
    TagsInput,
    ChessPuzzleInput,
  },

  props: {
    courseCfg: {
      type: Object as PropType<CourseConfig>,
      required: true,
      default: () => ({
        courseID: 'default-test',
      }),
    },
    dataShape: {
      type: Object as PropType<DataShape>,
      required: true
    }
  },

  setup(props) {
    const store = useStore();
    const { log, error, warn } = SkldrComposable();
    
    const fieldInputWraps = ref<HTMLDivElement[]>([]);
    const tagsInput = ref(null);
    const allowSubmit = ref(false);
    const uploading = computed({
      get: () => store.state.dataInputForm.uploading,
      set: (val) => store.state.dataInputForm.uploading = val
    });

    // Rest of setup logic converting class properties and methods...
    
    return {
      // Return refs, computed properties and methods
      fieldInputWraps,
      tagsInput,
      allowSubmit,
      uploading,
      // ...other returns
    };
  }
});
</script>
