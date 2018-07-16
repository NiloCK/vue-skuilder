<template>
  <div>
    <ul>
      <li v-for="dataShape in dataShapes" :key="dataShape.name" >
       {{ dataShape.name }} - {{ dataShape.registered }}
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
import { getDataShapes, getDoc } from '@/db';

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
  public dataShapes: DataShapeRegistrationStatus[] = [];

  public created() {
    // alert('hello');
    const dataShapeData = Courses.allDataShapes();

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
      });
    });

  }
}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>
