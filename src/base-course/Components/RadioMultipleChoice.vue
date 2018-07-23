<template>
  <div class="multipleChoice">
    <MultipleChoiceOption
        v-for='choice in choiceList'
        :key='choiceList.indexOf(choice)'
        :content='choice'
        :selected='choiceList.indexOf(choice) === currentSelection'
        :number='choiceList.indexOf(choice)'
        :setSelection='setSelection'
        :submit='forwardSelection'
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import MultipleChoiceOption from './MultipleChoiceOption.vue';
import UserInput from '@/base-course/Components/UserInput/UserInput';

@Component({
    components: {
        MultipleChoiceOption
    }
})
export default class RadioSelect extends UserInput {
    @Prop() public choiceList: string[];
    @Prop() public MouseTrap: MousetrapInstance;
    // @Prop() public submit: (selection: number) => void;

    public currentSelection: number = -1;

    public mounted() {
        this.$el.focus();
    }

    public created() {
        this.MouseTrap.bind('left', this.decrementSelection);
        this.MouseTrap.bind('right', this.incrementSelection);
        this.MouseTrap.bind('enter', this.forwardSelection);

        for (let i = 0; i < this.choiceList.length; i++) {
            this.bindNumberKey(i + 1);
        }
    }

    public forwardSelection(): void {
        if (this.currentSelection !== -1) {
            this.submitAnswer({
                options: this.choiceList,
                selection: this.currentSelection
            });
        }
    }

    public setSelection(selection: number): void {
        if (selection < this.choiceList.length) {
            this.currentSelection = selection;
        }
    }

    public incrementSelection() {
        // alert('increment');
        if (this.currentSelection === -1) {
            this.currentSelection = Math.ceil(this.choiceList.length / 2);
        } else {
            this.currentSelection = Math.min(
                this.choiceList.length - 1,
                this.currentSelection + 1
            );
        }
    }

    public decrementSelection() {
        // alert('dencrement');
        if (this.currentSelection === -1) {
            this.currentSelection = Math.floor((this.choiceList.length / 2) - 1);
        } else {
            this.currentSelection = Math.max(
                0,
                this.currentSelection - 1
            );
        }
    }

    private bindNumberKey(n: number): void {
        this.MouseTrap.bind(n.toString(), () => {
            this.currentSelection = n - 1;
        });
    }
}
</script>
