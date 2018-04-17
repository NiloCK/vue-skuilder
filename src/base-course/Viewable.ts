import { Component, Prop, Vue } from 'vue-property-decorator';
import { DisplayableData } from '@/db/types';
import moment from 'moment';

// @Component
export default abstract class Viewable extends Vue {
  @Prop() public data: any;
  protected startTime: moment.Moment;

  public created() {
    this.startTime = moment();
  }
  /**
   * Returns the time in MS since the element was created
   */
  public getTime(): number {
    return moment().diff(this.startTime, 'milliseconds');
  }
}
