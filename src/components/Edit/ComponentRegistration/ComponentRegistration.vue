<template>
  <div>
    <ul>
      <li v-for="dataShape in dataShapes" :key="dataShape.name" >
       {{ dataShape.name }} - {{ dataShape.registered }}
       <ul>
         <li v-for="view in dataShape.dataShape.views" :key="view.name">
           {{ view.name }}
         </li>
       </ul>
      </li>  
    </ul>
      
  </div>
</template>


<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { DataShape } from '@/base-course/Interfaces/DataShape';
import Courses from '@/courses';
import { getCourseDataShapes } from '@/courses';
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
    const dataShapeData = getCourseDataShapes(Courses);
    Object.keys(dataShapeData).forEach( (dataShapeName) => {
      getDoc(dataShapeName).then( (doc) => {
        this.dataShapes.push({
          name: dataShapeName,
          dataShape: dataShapeData[dataShapeName],
          registered: true
        });
      }).catch( (err) => {
        this.dataShapes.push({
          name: dataShapeName,
          dataShape: dataShapeData[dataShapeName],
          registered: false
        });
      });
    });
    // this.dataShapes[0].dataShape.views
  }
}
</script>

<style scoped>
div {
  margin-top: 15px;
}
</style>
