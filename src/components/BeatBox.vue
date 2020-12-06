<template>
  <div class="beatbox"
    v-bind:class="{ playing: playing == n - 1 }"
    @touchmove="touchMove"
  >
    <div class="innerBoxWrapper">
      <inner-box v-for="m in 9" v-bind:ref="'innerbox_' + (m-1)"
        :m="m" :n="n" v-bind:key="m" :draggingState="draggingState"
        @innerClick="innerClick"
        @setDraggingState="setDraggingState"
        :dataArray="dataArray"
        :drawMode="drawMode"
      ></inner-box>
    </div>
  </div>
</template>

<script>
import InnerBox from './InnerBox'
// import vueSlider from 'vue-slider-component'

// handles sliders
export default {
  name: 'beat-box',
  props: ['n', 'playing', 'dataArray', 'drawMode'],
  components: {
    InnerBox,
    // vueSlider
  },
  data: function () {
    return {
      verticalSlider: {value: 50},
      horizontalSlider: 0,
      sliderStyle: {position: 'absolute'},
      draggingState: 0,
      lastTouched: null
    }
  },
  mounted: function () {
  },
  watch: {
  },
  computed: {
  },
  methods: {
    setDraggingState: function(ds) {
      this.draggingState = ds
      this.lastTouched = null;
    },
    innerClick: function (m, n, state, drawMode) {
      let total = 0
      for (let ref of Object.values(this.$refs)) {
        total += ref[0].state
      }
      if ((total > 50) || (total < 6)) {
        this.$emit('innerClick', 0, n, total % 2)
      }
      this.$emit('innerClick', m, n, state, drawMode)
    },
    doSlider: function (v) {
      this.$emit('innerClick', 0, this.n, v)
    },
    touchMove: function(e) {
      var xPos = e.touches[0].pageX;
      var yPos = e.touches[0].pageY;

      let touchedEl = document.elementFromPoint(xPos, yPos)
      if (touchedEl !== this.lastTouched) {
        if (((touchedEl || {}).__vue__ || {}).click) {
          touchedEl.__vue__.click()
          this.lastTouched = touchedEl
        }
      }
    }
  }
}
</script>

<style>
.beatbox {
  width: 25%;
  height: 25%;
  border: black 2px solid;
  box-sizing: border-box;
  position: relative;
}
.innerBoxWrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
}
.beatbox.playing {
  background-color: pink;
  opacity: 0.6;
}
.beatbox .vue-slider-wrap {
  position: absolute !important;
  width: 100% !important;
  top: -16px !important;
}
.beatbox .vue-slider-wrap .vue-slider {
  background-color: unset !important;
}
.beatbox .vue-slider div.vue-slider-process {
  background-color: unset !important;
}
</style>
