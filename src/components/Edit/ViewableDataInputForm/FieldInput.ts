import { ValidatingFunction } from '@/base-course/Interfaces/ValidatingFunction';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ValidationResult } from '@/base-course/Interfaces/ValidationResult';
import { Status } from '@/enums/Status';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';

export interface ValidatedInput {
    getValidators: () => ValidatingFunction[];
}

export abstract class FieldInput extends Vue {
    @Prop() public field: FieldDefinition;
    public validationStatus: ValidationResult = {
        status: Status.ok,
        msg: ''
    };
    @Prop() private store: any;

    public abstract getValidators(): ValidatingFunction[];

    public userInput = () => {
        return this.store[this.field.name];
    }

    public validate = () => {
        // 'this' is null if
        // public validate() {...} used instead
        // ...

        // alert(this);
        // alert(this.store[this.field.name]);
        let ret: ValidationResult = {
            status: Status.ok,
            msg: ''
        };

        const validators = this.getValidators();
        let index = 0;
        while (ret.status === Status.ok && index < validators.length) {
            ret = validators[index](this.userInput());
            index++;
        }

        // the below works (eg, vue reactivity), but
        // this.validationStatus = ret does NOT
        this.validationStatus.status = ret.status;
        this.validationStatus.msg = ret.msg;

        return ret;
    }
}
