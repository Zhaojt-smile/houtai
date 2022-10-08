<template>
  <div class="box">
    <!-- 内部属性 -->
    <div @scroll="scrollEvent" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" ref="scrollEl"
      :style="{ top: `${translateY}px` }" class="scroll-box">
      <div class="loadingBox" v-if="touchstartTitleShow">{{startText}}</div>
      <div class="loadingBox" v-if="touchEndTitleShow">加载中...</div>
      <!-- 插槽 -->
      <slot></slot>
      <div class="end-text" v-if="!isScroll">{{ endText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, toRefs } from 'vue';
const $emits = defineEmits(['getList', 'refeshList'])
const props = defineProps(['distance', 'isScroll']);
const data = reactive({
  scrollEl: null,
  startText: "释放即可刷新...",
  scrollTop: 0,
  startY: 0,
  translateY: 0,
  touchEndTitleShow: false, //控制手指离开屏幕的title显示
  touchstartTitleShow: false, //控制手指按下屏幕的title显示
  endText: '没有更多了~'
});
let {
  scrollEl,
  startText,
  scrollTop,
  touchstartTitleShow,
  touchEndTitleShow,
  translateY,
  endText
} = toRefs(data);

const scrollEvent = (e) => {
  data.scrollTop = e.srcElement.scrollTop;
  if (!props.isScroll) return;
  if (
    data.scrollTop + e.srcElement.offsetHeight >
    e.srcElement.scrollHeight - props.distance
  ) {
    $emits("getList");
  }
}

// 手指开始
const touchstart = (e) => {
  let y = e.targetTouches[0].pageY
  data.startY = y
}
// 手指移动
const touchmove = (e) => {
  let y = e.targetTouches[0].pageY
  if (y > data.startY && data.scrollTop == 0) {
    data.touchstartTitleShow = true
    data.translateY = (y - data.startY) / 2
  } else {
    data.touchstartTitleShow = false
  }
}
// 手指松开
const touchend = (e) => {
  let y = e.changedTouches[0].pageY;
  if (y > data.startY) {
    data.translateY = 0;
    data.touchstartTitleShow = false;
    data.touchEndTitleShow = true;
    $emits('refeshList', () => {
      data.touchEndTitleShow = false
    })
    data.startY = 0
  }
}
</script>

<style lang="scss" scoped>
.box {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 90vh;
  z-index: 999;

  .loadingBox {
    padding: 20px;
    text-align: center;
  }
}

.scroll-box {
  height: 90vh;
  width: 100%;
  overflow: auto;
  transition: all 0s ease 0s;
  position: absolute;
  right: 0;

  .end-text {
    text-align: center;
    height: 50px;
    line-height: 50px;
    color: #999;
  }
}
</style>