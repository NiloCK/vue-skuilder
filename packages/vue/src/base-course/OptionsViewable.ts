// import moment from 'moment';
// import MouseTrap from 'mousetrap';
// import { defineComponent, PropType, ref, computed } from 'vue';
// import { HotKey } from '../SkldrMouseTrap';
// import { Answer, Displayable, Question } from '../base-course/Displayable';
// import { ViewData } from '../base-course/Interfaces/ViewData';
// import { CardRecord, QuestionRecord } from '../db/types';

// // Base Viewable component
// export const Viewable = defineComponent({
//   name: 'Viewable',

//   props: {
//     data: {
//       type: Array as PropType<ViewData[]>,
//       required: true,
//     },
//   },

//   setup(props, { emit }) {
//     const startTime = ref(moment.utc());
//     const MouseTrapInstance = ref<MouseTrap.MousetrapInstance>();
//     const hotKeys = ref<HotKey[]>([]);

//     // Logger methods
//     const log = (message?: any, ...optionalParams: any[]): void => {
//       console.log(`[V.Viewable]: `, message, ...optionalParams);
//     };

//     const error = (message?: any, ...optionalParams: any[]): void => {
//       console.error(`[V.Viewable]: `, message, ...optionalParams);
//     };

//     const warn = (message?: any, ...optionalParams: any[]): void => {
//       console.warn(`[V.Viewable]: `, message, ...optionalParams);
//     };

//     // Computed properties
//     const timeSpent = computed((): number => {
//       return Math.abs(moment.utc().diff(startTime.value, 'milliseconds'));
//     });

//     // Methods
//     const getURL = (item: string, dataShapeIndex: number = 0): string => {
//       if (props.data[dataShapeIndex]?.[item]) {
//         return URL.createObjectURL(props.data[dataShapeIndex][item] as any);
//       }
//       return '';
//     };

//     const emitResponse = (r: CardRecord) => {
//       emit('emitResponse', r);
//     };

//     const toString = (): string => {
//       console.warn('toString() not implemented');
//       return '!!! preview not implemented !!!';
//     };

//     return {
//       startTime,
//       MouseTrapInstance,
//       hotKeys,
//       log,
//       error,
//       warn,
//       timeSpent,
//       getURL,
//       emitResponse,
//       toString,
//     };
//   },
// });

// // QuestionView component
// export const QuestionView = defineComponent({
//   name: 'QuestionView',
//   extends: Viewable,

//   props: {
//     modifyDifficulty: Number,
//   },

//   setup(props, { emit }) {
//     const priorSessionViews = ref(0);
//     const priorAttempts = ref(0);
//     const priorAnswers = ref<[Answer, string][]>([]);
//     const maxAttemptsPerView = ref(3);
//     const maxSessionViews = ref(1);

//     const submitAnswer = (answer: Answer, submittingClass?: string): QuestionRecord => {
//       console.log('QuestionView.submitAnswer called...');
//       priorAnswers.value.push([answer, submittingClass ? submittingClass : '']);

//       // Note: This needs to be implemented in the extending component
//       const evaluation = (this as any).question.evaluate(answer, (this as any).timeSpent);

//       const record: QuestionRecord = {
//         ...evaluation,
//         priorAttemps: priorAttempts.value,
//         courseID: '',
//         cardID: '',
//         timeSpent: (this as any).timeSpent,
//         timeStamp: (this as any).startTime,
//         userAnswer: answer,
//       };

//       if (!evaluation.isCorrect) {
//         priorAttempts.value++;
//       }
//       emit('emitResponse', record);
//       return record;
//     };

//     return {
//       priorSessionViews,
//       priorAttempts,
//       priorAnswers,
//       maxAttemptsPerView,
//       maxSessionViews,
//       submitAnswer,
//     };
//   },
// });

// // InformationView component
// export const OptionsInformationView = defineComponent({
//   name: 'InformationView',
//   extends: Viewable,
// });

// // Helper function
// export function isQuestionView(v: any): v is typeof QuestionView {
//   return v.submitAnswer !== undefined;
// }
