import "./style.css";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import mapConfig from "./assets/data.json";
import chinaGeo from "./assets/chinaProvince.json";
import { FlyLayer } from "../lib";
import { FlyDataItem } from "../lib/type";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="map"></div>
`;

let map = L.map(document.getElementById("map")!).setView(
  [35.428912, 110.029026],
  4
);

Object.values(mapConfig).forEach((val) => {
  L.tileLayer(val.url, { ...val, zoomOffset: 1 }).addTo(map);
});

const style = {
  color: "#00FFCC", // 边框颜色
  weight: 1, // 边框粗细
  opacity: 0.8, // 透明度
  // fillColor: 'transparent', // 区域填充颜色
  fillOpacity: 0.6, // 区域填充颜色的透明
  symbolSize: 5,
};

L.geoJSON(chinaGeo as any, {
  style: () => ({ ...style, fillOpacity: Math.random() }),
}).addTo(map);

function renderName() {
  for (const city of chinaGeo.features) {
    const { properties } = city;
    const centerArr = properties.centroid;
    if (!centerArr) continue;
    const myIcon = L.divIcon({
      html: `<div style='color:#FFDC51;font-size:12px;font-weight:400'>${
        properties.name ?? ""
      }</div>`,
      className: "my-div-icon",
      iconSize: [50, 50],
    });
    L.marker([...centerArr].reverse() as L.LatLngExpression, {
      icon: myIcon,
    }).addTo(map);
  }
}

renderName();

const startLatLng = [119.306239, 26.075302];

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
  }).addTo(map);
  flyLayer.on("click", (e) => {
    console.log("e", e);
  });
  console.log("flyLayer", flyLayer);
}

renderFly();
