## leaflet 飞线

<p align="center">
<!-- <a href="https://circleci.com/gh/csjiabin/leaflet-fly/tree/main"><img src="https://img.shields.io/circleci/project/github/csjiabin/leaflet-fly/main.svg?sanitize=true" alt="Build Status"></a> -->
<!-- <a href="https://codecov.io/github/csjiabin/leaflet-fly?branch=main"><img src="https://img.shields.io/codecov/c/github/csjiabin/leaflet-fly/main.svg?sanitize=true" alt="Coverage Status"></a> -->
<a href="https://npmcharts.com/compare/leaflet-fly?minimal=true"><img src="https://img.shields.io/npm/dm/leaflet-fly.svg?sanitize=true" alt="Downloads"></a>
<a href="https://www.npmjs.com/package/leaflet-fly"><img src="https://img.shields.io/npm/v/leaflet-fly.svg?sanitize=true" alt="Version"></a>
<a href="https://www.npmjs.com/package/leaflet-fly"><img src="https://img.shields.io/npm/l/leaflet-fly.svg?sanitize=true" alt="License"></a>

</p>

### 🚀 Installation

```bash
npm install leaflet-fly
# or
yarn add leaflet-fly
```

### 💡 Usage

```html
<script setup lang="ts">
  import { onMounted, shallowRef, ref } from "vue";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import { FlyLayer, type FlyDataItem } from "leaflet-fly";
  import chinaGeo from "../../src/assets/chinaProvince.json";
  let map = shallowRef<L.Map>();
  let mapRef = ref<HTMLDivElement>();
  const startLatLng = [119.306239, 26.075302];
  function renderGeo() {
    const style = {
      color: "#00FFCC", // 边框颜色
      weight: 1, // 边框粗细
      opacity: 0.8, // 透明度
      // fillColor: 'transparent', // 区域填充颜色
      fillOpacity: 0.6, // 区域填充颜色的透明
      symbolSize: 5,
    };
    L.geoJSON(chinaGeo, {
      style: () => ({ ...style, fillOpacity: Math.random() }),
    }).addTo(map.value);
  }
  function renderFly() {
    // const data = [
    //   {
    //     id: 1,
    //     labels: ['from', 'to'],
    //     from: [...startLatLng].reverse(),
    //     to: [33.902648, 113.619717],
    //   },
    // ];
    let list: FlyDataItem[] = [];
    for (const item of chinaGeo.features) {
      const { properties } = item;
      const centerArr = properties.center;
      if (!centerArr) continue;
      if (properties.adcode === 350000) continue;
      list.push({
        labels: ["from", "to"],
        from: [...startLatLng].reverse() as L.LatLngExpression,
        to: [...centerArr].reverse() as L.LatLngExpression,
        options: {
          line: {
            color:
              "#" + Math.random().toString(16).substring(2, 8).padEnd(6, "0"),
            opacity: 1,
          },
        },
      });
    }
    let flyLayer = new FlyLayer(list, {
      marker: {
        // autoMove: false,
        // duration: 40,
      },
    }).addTo(map.value);
    flyLayer.on("click", (e: any) => {
      console.log("e", e);
    });
  }

  onMounted(() => {
    map.value = L.map(mapRef.value).setView([35.428912, 110.029026], 4);
    renderGeo();
    renderFly();
  });
</script>

<template>
  <div ref="mapRef" style="width: 100vw; height: 100vh"></div>
</template>
```

### Type

```ts
export type MarkerIcon =
  | L.MarkerOptions["icon"]
  | ((data: FlyDataItem) => L.MarkerOptions["icon"]);

export interface FlyOptions {
  /**
   * 飞线配置
   * @default {color: '#fff', weight: 2, opacity: 0.5}
   */
  line?: L.PolylineOptions;
  /**
   * @default {radius: 5, color: '#fff', weight: 1, opacity: 0.5}
   */
  marker?: {
    /** 移动动画 icon */
    moveIcon?: MarkerIcon;
    /** 出发点 icon */
    formIcon?: MarkerIcon;
    /** 目标点 icon */
    toIcon?: MarkerIcon;
    /** 自动旋转 */
    autoRotation?: boolean;
    /** 自动移动 */
    autoMove?: boolean;
    /** 循环动画 */
    loop?: boolean;
    /** 移动动画时长 */
    duration?: number;
  };
}

export interface FlyDataItem {
  labels: [form: string, to: string];
  /** 出发点经纬度 */
  from: L.LatLngExpression;
  /** 目标点经纬度 */
  to: L.LatLngExpression;
  options?: FlyOptions;
}
```

### Screenshot

<p align="center">
    <a href="https://github.com/csjiabin/leaflet-fly" target="_blank">
    <img src="https://raw.githubusercontent.com/csjiabin/leaflet-fly/HEAD/screenshot.png">
    </a>
</p>
