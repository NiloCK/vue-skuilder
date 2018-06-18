<template>
    <div :class='className'>
        {{ content }}
    </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class MultipleChoiceOption extends Vue {
    @Prop() public content: string;
    @Prop() public selected: boolean;
    @Prop() public number: number;

    get className(): string {
        if (this.selected) {
            return 'choice selected';
        } else {
            return 'choice';
        }
    }
}
</script>

<style scoped>
.choice {
    display: inline-block;
    border-radius: 4px;
    padding: 15px;
    margin: 10px;
}

.selected{
    transition: all ease-out .15s;
    box-shadow: 2px 3px 4px 2px;
    transform:
        translateY(-10px)
        /* rotate(3deg) */
        scale(1.15);
}

.choice:nth-child(1){
    background-color: lightgreen;
    outline-width: 5px; 
}
.choice:nth-child(2){
    /* section for 'selected' element */
    /* transform: rotate(45); */

    /* end section */
    background-color: lightcoral;
}
.choice:nth-child(3){
    background-color: lightskyblue;
}
.choice:nth-child(4){
    background-color: peachpuff;
}
.choice:nth-child(5){
    background-color: yellowgreen;
}
.choice:nth-child(6){
    background-color: lightsalmon;
}
</style>
