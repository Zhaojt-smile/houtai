<template>
  <div class="box">
    <div class="bg-box">
      <img class="bgImg" src="../assets/images/bg.png" alt="">
      <div class="title-text">
        <h2>科学防护 共渡难关</h2>
        <h3>肺炎疫情实时动态播报</h3>
      </div>
      <div class="cards" v-if="chinaTotal.total">
        <div class="card-tab">
          <div @click="data.type = 1" :class="{ active: data.type === 1 }">全国疫情数据(含港澳台)</div>
          <div @click="data.type = 2" :class="{ active: data.type === 2 }">山西疫情数据</div>
        </div>
        <!-- 全国疫情 -->
        <div v-show="data.type === 1" class="card-info">
          <div>
            <h4 class="title">境外输入</h4>
            <p class="number">{{ chinaTotal.total.input }}</p>
            <p class="tip">
              较昨日
              <span>+{{ chinaTotal.today.input }}</span>
            </p>
          </div>
          <div>
            <h4 class="title">无症状感染者</h4>
            <p class="number">{{ chinaTotal.extData.noSymptom }}</p>
            <p class="tip">
              较昨日
              <span>+{{ chinaTotal.extData.incrNoSymptom }}</span>
            </p>
          </div>
          <div>
            <h4 class="title">现有确诊</h4>
            <p class="number">
              {{
              chinaTotal.total.confirm -
              chinaTotal.today.dead -
              chinaTotal.today.heal
              }}
            </p>
            <p class="tip">
              较昨日
              <span>+{{ chinaTotal.today.storeConfirm }}</span>
            </p>
          </div>
          <div>
            <h4 class="title">累计确诊</h4>
            <p class="number">{{ chinaTotal.total.confirm }}</p>
            <p class="tip">
              较昨日
              <span>+{{ chinaTotal.today.confirm }}</span>
            </p>
          </div>
          <div>
            <h4 class="title">累计死亡</h4>
            <p class="number">{{ chinaTotal.total.dead }}</p>
            <p class="tip">
              较昨日
              <span>+{{ chinaTotal.today.dead }}</span>
            </p>
          </div>
          <div>
            <h4 class="title">累计治愈</h4>
            <p class="number">{{ chinaTotal.total.heal }}</p>
            <p class="tip">
              较昨日
              <span>+{{ chinaTotal.today.heal }}</span>
            </p>
          </div>
        </div>
        <!-- 山西疫情 -->
        <div v-show="data.type === 2" class="card-info">
          <div>
            <h4 class="title">累计确诊</h4>
            <p class="number">{{ sxData.total.confirm }}</p>
            <p class="tip">
              较昨日
              <span>+{{ sxData.today.confirm }}</span>
            </p>
          </div>
          <div>
            <h4 class="title">累计死亡</h4>
            <p class="number">{{ sxData.total.dead }}</p>
            <p class="tip">
              较昨日
              <span>+{{ sxData.today.dead }}</span>
            </p>
          </div>
          <div>
            <h4 class="title">累计治愈</h4>
            <p class="number">{{ sxData.total.heal }}</p>
            <p class="tip">
              较昨日
              <span>+{{ sxData.today.heal }}</span>
            </p>
          </div>
        </div>
        <div class="card-date">
          <p>截止{{data.lastUpdateTime}}</p>
        </div>
      </div>
      <div class="data-map content">
        <h3>中国疫情</h3>
        <div class="map-box">
          <div :class="data.mapType == 1 ? 'to-left' : 'to-right'" id="map" ref="map" @click="toLeft"></div>
          <div :class="data.mapType == 1 ? 'to-left' : 'to-right'" id="map2" ref="map2"></div>
        </div>
        <div class="map-btn">
          <div @click="data.mapType = 1" :class="{ active: data.mapType == 1 }">
            现有确诊
          </div>
          <div @click="data.mapType = 2" :class="{ active: data.mapType == 2 }">
            累计确诊
          </div>
        </div>
      </div>
    </div>
    <!-- 列表 -->
    <div class="list">
      <h3>中国病例</h3>
      <List v-if="china.length > 0" :showChildren="true" :list="china" :msg="'中国疫情'" />
    </div>
    <div v-if="data.showList.length > 0" class="list">
      <h3>世界病例</h3>
      <Scroll @getList="getList" @refeshList="refeshList" :distance="100" :isScroll="data.isScroll">
        <List :showChildren="false" :list="data.showList" :msg="'世界疫情'" />
      </Scroll>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { ref, reactive, toRefs, onMounted } from 'vue'
import { getData } from '../api/Home.js'
import chinaJson from '../assets/china.json'
import List from './List.vue'
import Scroll from './Scroll.vue';
import jsonp from 'jsonp';

const data = reactive({
  // 地区数据
  areaTree: [],
  chinaDayList: [],
  chinaTotal: [],
  china: {},
  sxData: [],
  showList: [],
  isScroll: true,
  type: 1,
  mapType: 1,
  lineType: 1,
  lastUpdateTime: 'string',
})
const { chinaTotal, sxData, china, areaTree } = toRefs(data)

const map = ref()
const map2 = ref()
let page = 0
const getList = () => {
  if (page === data.areaTree.length - 1) {
    data.isScroll = false
    return
  }
  page++
  data.showList.push(...data.areaTree[page])
}

// 获取每页数据
const getPageList = (list) => {
  const arr = []
  for (let i = 0; i < list.length; i += 30) {
    arr.push(list.slice(i, i + 30))
  }
  return arr
}
// 渲染地图
const options = {
  title: {
    subtext: '单击省份可以查看病例数'
  },
  tooltip: {
    trigger: "item",
    formatter: "现有确诊病例<br/>{b}: {c} "
  },
  visualMap: {
    show: false,
  }

}
const series = {
  type: "map",//
  map: "china",
  colorBy: "series",//按照系列分配调色盘中的颜色，同一系列中的所有数据都是用相同的颜色
  zoom: 1.3,//当前视角的缩放比例
  top: 80,//组件离容器上侧的距离
  label: {
    show: true,
    color: "#333",
    fontSize: 10,
  }
}

getData().then(res => {
  const result = res.data.data
  data.areaTree = getPageList(result.areaTree);
  data.showList = data.areaTree[0];
  data.chinaDayList = result.chinaDayList;
  data.chinaTotal = result.chinaTotal;
  data.china = result.areaTree.find(item => item.id === '0').children;
  data.sxData = data.china.find(item => item.id === '140000')
  data.lastUpdateTime = result.lastUpdateTime;
  // 地图
  var myMap = echarts.init(map.value)
  var myMap2 = echarts.init(map2.value)
  echarts.registerMap("china", chinaJson)
  myMap.showLoading()
  let mapData = []
  let map2Data = []
  data.china.map(v => {
    mapData.push({
      name: v.name,
      value: v.total.confirm - v.total.dead - v.total.heal || 0
    }),
      map2Data.push({
        name: v.name,
        value: v.total.confirm,
      })
  })
  myMap.hideLoading()
  // 地图1
  myMap.setOption({
    ...options,
    series: {
      ...series,
      data: mapData
    }
  })
  // 地图2
  myMap2.setOption({
    ...options,
    series: {
      ...series,
      data: map2Data
    }
  })
})
// 刷新数据
const refeshList = (fun) => {
  getData().then(() => {
    page = 0;
    data.isScroll = true;
    fun();
  });
}


</script>

<style lang="scss" scoped>
.list {
  h3 {
    margin-left: 20px;
    border-left: 8px solid red;
    padding: 0 16px;
    z-index: -1;
  }
}

@keyframes toRight {
  from {
    left: 0;
  }

  to {
    left: calc(0px - 100vw + 1rem);
  }
}

@keyframes toLeft {
  from {
    left: calc(0px - 100vw + 1rem);
  }

  to {
    left: 0;
  }
}

.content {
  padding: 0 1rem;
}

.data-map,
.data-list {
  margin-top: 130px;
  overflow: hidden;

  h3 {
    border-left: 8px solid #e10000;
    padding-left: 1rem;
  }
}

.map-box {
  display: flex;
  width: 200%;
}

.data-line {
  margin-top: 20px;
}

#line,
#line1,
#line2 {
  height: 400px;
  width: 100%;
}

#map,
#map2 {
  height: 350px;
  width: 50%;
  animation-fill-mode: forwards;
  left: 0;
}

#map {
  margin-right: 1rem;
}

#map2 {
  margin-left: 1rem;
}

.to-left {
  animation: toLeft 1s;
}

.to-right {
  animation: toRight 1s;
}

.map-btn,
.line-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;

  >div {
    width: 45%;
    height: 40px;
    line-height: 40px;
    border: 1px solid #d2d2d2;
    box-shadow: 0 5px 7px 1px rgb(0 0 0 / 5%);
    border-radius: 5px;
    text-align: center;

    &.active {
      border-color: #ce4733;
      background-color: #fef7f7;
      color: #ce2c1e;
    }
  }
}

.line-btn {
  >div {
    width: 30%;
    height: 55px;
    line-height: 25px;
    padding-top: 5px;
  }
}

.data-list {
  margin-top: 20px;
}

.cards {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 96%;
  height: auto;
  background: #fff;
  top: 140px;
  margin: 0 8px;
  background-color: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 20px rgb(0 0 0 /10%);

  .card-date {
    margin-left: 24px;
    line-height: 10px;
    font-size: 12px;
  }

  .card-tab {
    display: flex;
    justify-content: space-between;
    background: #efefef;
    border-radius: 16px;

    &>div {
      width: 50%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      background-color: #efefef;
      font-size: 16px;

      &.active {
        background: #fff;
      }
    }
  }

  .card-info {
    display: flex;
    flex-wrap: wrap;
    margin: 0 10px;

    &>div {
      width: 33%;
      line-height: 2px;
      text-align: center;

      &:nth-child(1) {
        line-height: 6px;

      }

      &:nth-child(2) {
        line-height: 6px;

        .number,
        span {
          color: #ffa352;
        }
      }

      &:nth-child(3) {
        line-height: 6px;

        .number,
        span {
          color: #791618;
        }
      }

      &:nth-child(4) {
        line-height: 6px;

        .number,
        span {
          color: #e44a3d;
        }
      }

      &:nth-child(5) {
        line-height: 6px;

        .number,
        span {
          color: #333;
        }
      }

      &:nth-child(6) {
        line-height: 6px;

        .number,
        span {
          color: #34aa70;
        }
      }

      .title {
        font-size: 12px;
      }

      .number {
        font-size: 18px;
        font-weight: 600;
        margin: 5px 0;
        color: #a31d13;

        span {
          color: #a31d13;
        }
      }

      .tip {
        font-size: 12px;
      }

      .data {
        font-size: 20px;
      }
    }
  }
}

.bgImg {
  width: 100%;
}

.bg-box {
  position: relative;

  .title-text {
    position: absolute;
    top: 0;
    left: 20px;
    color: #fff;
  }
}
</style>