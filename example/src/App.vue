<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FlyLayer } from "leaflet-fly";
import chinaGeo from "../../src/assets/chinaProvince.json";
let map = shallowRef<L.Map>();
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
  let list = [];
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
  map.value = L.map(document.getElementById("map")!).setView(
    [35.428912, 110.029026],
    4
  );
  renderGeo();
  renderFly();
});
</script>

<template>
  <div id="map" style="width: 100vw; height: 100vh"></div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
