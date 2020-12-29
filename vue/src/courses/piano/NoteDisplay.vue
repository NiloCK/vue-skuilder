<template>
  <svg 
    width="300px"
    height="auto"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
    sodipodi:docname="keys.svg"
    inkscape:version="1.0rc1 (09960d6f05, 2020-04-09)"
    id="svg8" version="1.1" viewBox="0 0 175.24936 73.594925"
  >
    <defs id="defs2" />
    <sodipodi:namedview inkscape:window-maximized="1" inkscape:window-y="726" inkscape:window-x="1491" inkscape:window-height="1321" inkscape:window-width="2400" showborder="false" showgrid="false" inkscape:document-rotation="0" inkscape:current-layer="layer1" inkscape:document-units="mm" inkscape:cy="255.88343" inkscape:cx="754.94284" inkscape:zoom="0.98994949" inkscape:pageshadow="2" inkscape:pageopacity="0.0" borderopacity="1.0" bordercolor="#666666" pagecolor="#ffffff" id="base" />
    <metadata id="metadata5">
      <rdf:RDF>
        <cc:Work rdf:about="">
          <dc:format>image/svg+xml</dc:format>
          <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
          <dc:title></dc:title>
        </cc:Work>
      </rdf:RDF>
    </metadata>
    <g transform="translate(167.75219,-151.96011)" id="layer1" inkscape:groupmode="layer" inkscape:label="Layer 1">
      <!-- 0 c -->
      <rect y="152.19064" x="-150.12129" height="73.220116" width="17.486626" id="rect845" 
        :style="style(0)" />
      <!-- 2 d -->
      <rect :style="style(2)" id="rect845-9" width="17.486626" height="73.220116" x="-132.63466" y="152.19064" />
      <!-- 4 e -->
      <rect :style="style(4)" id="rect845-6" width="17.486626" height="73.220116" x="-115.14803" y="152.19064" />
      <!-- 5 f -->
      <rect :style="style(5)" id="rect845-4" width="17.486626" height="73.220116" x="-97.661407" y="152.19064" />
      <!-- 7 g -->
      <rect :style="style(7)" id="rect845-92" width="17.486626" height="73.220116" x="-80.174782" y="152.19064" />
      <!-- 9 a -->
      <rect :style="style(9)" id="rect845-3" width="17.486626" height="73.220116" x="-62.688156" y="152.19064" />
      <!-- 11 b -->
      <rect :style="style(11)" id="rect845-0" width="17.486626" height="73.220116" x="-45.20153" y="152.19064" />
      <!-- second c (dnh) -->
      <rect :style="style(white)" id="rect845-30" width="17.486626" height="73.220116" x="-27.714905" y="152.10745" />
      <!-- 1 c# -->
      <rect ry="0" y="152.10744" x="-138.43532" height="54.415863" width="10.466455" id="rect898" 
        :style="style(1)" />
      <!-- 3 d# -->
      <rect :style="style(3)" id="rect898-3" width="10.466455" height="54.415863" x="-120.84978" y="152.10744" ry="0" />
      <!-- 6 f# -->
      <rect :style="style(6)" id="rect898-7" width="10.466455" height="54.415863" x="-85.678711" y="152.10744" ry="0" />
      <!-- 8 g# -->
      <rect :style="style(8)" id="rect898-8" width="10.466455" height="54.415863" x="-68.09317" y="152.10744" ry="0" />
      <!-- 10 a# -->
      <rect :style="style(10)" id="rect898-1" width="10.466455" height="54.415863" x="-50.507633" y="152.10744" ry="0" />
      <!-- second d (do not highlight) -->
      <rect y="152.10745" x="-10.228278" height="73.220116" width="17.486626" id="rect845-30-1"
        :style="style(white)" />
      <!-- first b (do not highlight) -->
      <rect y="152.10744" x="-167.60791" height="73.220116" width="17.486626" id="rect845-30-9"
        :style="style(white)" />
      <!-- second c# (dnh) -->
      <rect :style="style(black)" id="rect898-4" width="10.466455" height="54.415863" x="-15.336554" y="152.10744" ry="0" />
      <!-- first a# (dnh) -->
      <rect :style="style(black)" id="rect898-74" width="4.4679713" height="54.415863" x="-167.60791" y="152.10744" ry="0" />
      <!-- second d# (dnh) -->
      <rect :style="style(black)" id="rect898-10" width="5.1863246" height="54.507248" x="2.2092075" y="152.06175" ry="0" />
    </g>
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { QuestionView } from '@/base-course/Viewable';
import moment from 'moment';
import SkldrVue from '@/SkldrVue';
import Vuetify from 'vuetify/lib';

@Component({})
export default class NoteDisplay extends SkldrVue {
  @Prop({
    required: true,
    type: Number
  })
  public chroma: number;

  private readonly white: number = -1;
  private readonly black: number = -2;

  private style(n: number) {
    let color: string = '#ffffff';
    if (n === this.chroma) {
      color = this.$vuetify.theme.primary.toString();
    } else if (
      n === 1 ||
      n === 3 ||
      n === 6 ||
      n === 8 ||
      n === 10 ||
      n === this.black
    ) {
      color = '#000000';
    }

    return {
      "fill": color,
      "fill-opacity": 1,
      "stroke": "#000000",
      "stroke-width": 0.79375,
      "stroke-miterlimit": 4,
      "stroke-dasharray": 'none',
      "stroke-opacity": 1
    };
  }
}
</script>
