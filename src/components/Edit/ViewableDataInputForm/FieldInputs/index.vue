<template>
    <div>
        <div v-if="field.type === str">
            <StringInput v-bind:field="field" />
        </div>
        <div v-else-if="field.type === num">
            <NumberInput v-bind:field="field" />
        </div>
        <div v-else-if="field.type === int">
            <IntegerInput v-bind:field="field" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { FieldType } from '@/enums/FieldType';
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
  private readonly str: string = FieldType.STRING;
  private readonly int: string = FieldType.INT;
  private readonly num: string = FieldType.NUMBER;
}
</script>
