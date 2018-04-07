<template>
    <div>
        <div v-if="field.type === FieldType.STRING">
            <StringInput field="field" />
        </div>
        <div v-else-if="field.type === FieldType.NUMBER">
            <NumberInput field="field" />
        </div>
        <div v-else-if="field.type === FieldType.INT">
            <IntegerInput field="field" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition, FieldType } from '@/base-course/Course';
import NumberInput from './NumberInput.vue';
import StringInput from './StringInput.vue';
import IntegerInput from './IntegerInput.vue';

@Component({
    components: {
        NumberInput,
        StringInput,
        IntegerInput
    }
})
export default class FieldInput extends Vue {
  @Prop() public field: FieldDefinition;
}
</script>
