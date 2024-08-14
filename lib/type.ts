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
    /** 循环播放 */
    loop?: boolean;
    /** 移动动画时长 */
    duration?: number;
  };
}

export interface FlyDataItem {
  labels: [form: string, to: string];
  from: L.LatLngExpression;
  to: L.LatLngExpression;
  options?: FlyOptions["marker"] & FlyOptions;
}

export interface DrawFlyDataItem {
  points: L.LatLngExpression[];
  distance: number;
  data: FlyDataItem;
  labels: [form: string, to: string];
  from: L.LatLngExpression;
  to: L.LatLngExpression;
  options: FlyOptions["marker"] & FlyOptions;
}
