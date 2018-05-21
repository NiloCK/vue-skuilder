<template>
  <div class="Study">
    <h1>Study:</h1>
    <CardViewer />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import CardViewer from '@/components/Study/Cardviewer.vue';

@Component({
    components: {
        CardViewer
    }
})
export default class Study extends Vue{
};
</script>
