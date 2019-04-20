import { ValidatingFunction, validationFunctionToVuetifyRule } from '@/base-course/Interfaces/ValidatingFunction';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ValidationResult } from '@/base-course/Interfaces/ValidationResult';
import { Status } from '@/enums/Status';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';

export interface ValidatedInput {
    getValidators: () => ValidatingFunction[];
}

export abstract class FieldInput extends Vue {
    public $refs: {
        inputField: HTMLInputElement
    };

    @Prop() public field: FieldDefinition;
    public validationStatus: ValidationResult = {
        status: Status.ok,
        msg: ''
    };
    @Prop() protected store: any;

    public get validators(): ValidatingFunction[] {
        const ret = [];

        if (this.field.validator) {
            ret.push(this.field.validator.test);
        }
        return ret;
    }

    public focus(): void {
        this.$refs.inputField.focus();
    }

    public userInput = () => {
        return this.store[this.field.name];
    }

    public setData(data: any) {
        this.store[this.field.name] = data;
    }

    public clearData() {
        if (this.$refs.inputField.type === 'file') {
            log(`Clearing the file inputs...`);
            this.$refs.inputField.value = '';
        }
        this.store[this.field.name] = '';
    }

    public vuetifyRules() {
        if (this.field.validator) {
            return this.validators.map((f) => {
                return validationFunctionToVuetifyRule(f);
            });
        } else {
            return [];
        }
    }

    public validate = () => {
        // 'this' is null if
        // public validate() {...} used instead
        // ...

        let ret: ValidationResult = {
            status: Status.ok,
            msg: ''
        };

        const validators = this.validators;
        let index = 0;
        while (ret.status === Status.ok && index < validators.length) {
            ret = validators[index](this.userInput());
            index++;
        }

        // the below works (eg, vue reactivity), but
        // this.validationStatus = ret does NOT
        this.validationStatus.status = ret.status;
        this.validationStatus.msg = ret.msg;

        const validationResult = ret.status === Status.ok;

        // tslint:disable-next-line:no-string-literal
        Vue.set(this.store['validation'], this.field.name, validationResult);

        if (!validationResult) {
            // removing from the store object triggers vue reactivity on
            // the DataInputForm. This is a brutal hack, to be replaced
            // if / when I learn about Vuex, and implement better state
            // management on this form
            delete this.store[this.field.name];
        }

        return ret;
    }
}
