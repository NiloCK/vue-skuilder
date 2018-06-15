<template>
  <div class="multipleChoice">
        <div class="choice" v-for="choice in choiceList" :key="choiceList.indexOf(choice)">
            {{ choice }}
        </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator';

@Component({

})
export default class RadioSelect extends Vue {
    @Prop() public choiceList: string[];

    public selected: number = -1;
}
</script>

<style scoped>
.choice {
    display: inline-block;
    padding: 15px;
    margin: 10px;
}

.selected {
}

.choice:nth-child(1){
    background-color: lightgreen;
    outline-width: 5px; 
}
.choice:nth-child(2){
    /* section for 'selected' element */
    /* box-shadow: 0 0 7px 6px; */
    transform: translateY(-10px) rotate(3deg);
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
