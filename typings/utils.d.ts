import { default as L } from 'leaflet';
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
export declare const getPoints: (x1: number, y1: number, x2: number, y2: number, pointCount: number, level: number) => [x: number, y: number][];
/**
 * 经纬度距离计算
 */
export declare const calcDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
export declare const interpolatePosition: (p1: L.LatLng, p2: L.LatLng, duration: number, t: number) => L.LatLng;
