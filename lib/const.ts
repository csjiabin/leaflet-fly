import L from "leaflet";
import type { FlyOptions } from "./type";

export const EARTH_RADIUS = 6378.137;

const DEFAULT_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconSize: [14, 25],
  iconAnchor: [7, 25],
});
const DEFAULT_MOVE_ICON = L.divIcon({
  html: `<div style='border: 8px solid;border-color: transparent transparent red transparent;'></div>`,
  className: "move-icon",
  iconSize: [8, 8],
  iconAnchor: [8, 12],
});
export const DEFAULT_OPTIONS: FlyOptions = {
  line: {
    color: "#ff0000",
    weight: 2,
    opacity: 0.5,
    smoothFactor: 1.0,
  },
  marker: {
    // 移动动画 icon
    moveIcon: DEFAULT_MOVE_ICON,
    // 出发点 icon
    formIcon: DEFAULT_ICON,
    // 目标点 icon
    toIcon: DEFAULT_ICON,
    autoRotation: true,
    autoMove: true,
    loop: true,
    duration: 60,
  },
};
