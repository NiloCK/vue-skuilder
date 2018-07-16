<template>
  <div>
    <h3>DataShapes</h3>
    <ul>
      <li v-for="dataShape in dataShapes" :key="dataShape.name" >
       {{ dataShape.name }} - {{ dataShape.registered }}
       <button @click="registerShape(dataShape.name)">Register</button>
       <ul>
         <div v-for="view in dataShape.dataShape.views" :key="view.name">
          <li v-if="view">
            {{ view.name }}
          </li>
         </div>
       </ul>
      </li>  
    </ul>
      
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import Courses, { NameSpacer } from '@/courses';
import { getDataShapes, getDoc, putDataShape } from '@/db';
import * as _ from 'lodash';

interface DataShapeRegistrationStatus {
  name: string;
  dataShape: DataShape;
  registered: boolean;
}

@Component({
  components: {
  }
})
export default class ComponentRegistration extends Vue {
  @Prop() public course: string;
  public dataShapes: DataShapeRegistrationStatus[] = [];

  public created() {
    const dataShapeData = Courses.allDataShapes().filter((shape) => {
      return shape.course === this.course;
    });

    dataShapeData.forEach((shape) => {
      getDoc(NameSpacer.getDataShapeString(shape)).then((doc) => {
        this.dataShapes.push({
          name: shape.dataShape,
          dataShape: Courses.getDataShape(shape),
          registered: true
        });
      }).catch((err) => {
        this.dataShapes.push({
          name: shape.dataShape,
          dataShape: Courses.getDataShape(shape),
          registered: false
        });
      }).then(() => {
        this.dataShapes = _.sortBy(this.dataShapes, ['registered', 'name']);
      });
    });

  }

  private registerShape(shapeName: string) {
    const shape = this.dataShapes.find((findShape) => {
      return findShape.name === shapeName;
    })!;

    putDataShape(this.course, shape.dataShape);
  }

}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>
