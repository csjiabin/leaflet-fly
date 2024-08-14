import L from "leaflet";

import { EARTH_RADIUS } from "./const";

/**
 * 获取指定两点间圆弧上的点
 * @param x1 起点经度
 * @param y1 起点纬度
 * @param x2 终点经度
 * @param y2 终点纬度
 * @param pointCount 要获取的点的数量
 * @param level 弧度大小标定值，0~∞ 0为半圆，越大越接近直线
 * @returns {[x: number, y: number][]} 从起点到终点的顺序排列的结果点经纬度数组
 */
export const getPoints = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  pointCount: number,
  level: number
) => {
  // 圆的方程, (x - a)2 + (y - b)2 = r2. 其中rSquare为r2
  let a, b, rSquare, k, kv;
  let points: [x: number, y: number][] = [];
  if (x1 === x2) {
    a = x1 + (y2 - y1) * level;
    b = y1 + (y2 - y1) / 2;
    rSquare = (x1 - a) ** 2 + (y1 - b) ** 2;
  } else if (y1 === y2) {
    a = x1 + (x2 - x1) / 2;
    b = y1 - (x2 - x1) * level;
    rSquare = (x1 - a) ** 2 + (y1 - b) ** 2;
  } else {
    // xc: 中点X坐标, yc: 中点Y坐标, k: 垂直直线斜率, lenSquare: 中点到圆心距离的平方, l: 垂直直线方程(y=kx+l)中的l
    let xc = (x1 + x2) / 2,
      yc = (y1 + y2) / 2,
      lenSquare = ((x2 - x1) ** 2 + (y2 - y1) ** 2) * level ** 2;
    k = (x2 - x1) / (y1 - y2);
    let l = yc - k * xc;
    // 此处为一元二次方程三系数，ax2 + bx + c = 0, 其中 a1 为 a, b1 为 b, c1 为 c
    let a1 = 1 + k ** 2,
      b1 = 2 * k * (l - yc) - 2 * xc,
      c1 = xc ** 2 + (l - yc) ** 2 - lenSquare;
    kv = -1 / k;
    a =
      (-b1 +
        Math.sqrt(b1 ** 2 - 4 * a1 * c1) *
          ((kv > 0 && x2 > x1) || (kv < 0 && x2 < x1) ? 1 : -1)) /
      (2 * a1);
    b = k * a + l;
    rSquare = (x1 - a) ** 2 + (y1 - b) ** 2;
  }

  if (x1 === x2 || Math.abs(kv as number) > 1) {
    let yDistance = y2 - y1;
    let yDis = yDistance / (pointCount + 1);
    for (let i = 0; i < pointCount; i++) {
      let y = y1 + yDis * (i + 1);
      let x = Math.sqrt(rSquare - (y - b) ** 2) * (y2 > y1 ? -1 : 1) + a;
      points.push([x, y]);
    }
  } else {
    let xDistance = x2 - x1;
    let xDis = xDistance / (pointCount + 1);
    for (let i = 0; i < pointCount; i++) {
      let x = x1 + xDis * (i + 1);
      let y = Math.sqrt(rSquare - (x - a) ** 2) * (x2 > x1 ? 1 : -1) + b;
      points.push([x, y]);
    }
  }
  return points;
};

/**
 * 经纬度距离计算
 */
export const calcDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  let radLat1 = (lat1 * Math.PI) / 180;
  let radLat2 = (lat2 * Math.PI) / 180;
  let a = radLat1 - radLat2;
  let b = (lng1 * Math.PI) / 180 - (lng2 * Math.PI) / 180;
  let s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );
  s = s * EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s; // 单位千米
};

export const interpolatePosition = (
  p1: L.LatLng,
  p2: L.LatLng,
  duration: number,
  t: number
) => {
  var k = t / duration;
  k = k > 0 ? k : 0;
  k = k > 1 ? 1 : k;
  return L.latLng(
    p1.lat + k * (p2.lat - p1.lat),
    p1.lng + k * (p2.lng - p1.lng)
  );
};
