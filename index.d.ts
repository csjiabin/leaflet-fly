import { FlyLayer as _FlyLayer } from "./lib/index";
import { MovingMarker as _MovingMarker } from "./lib/movingMarker";
import { FlyOptions, FlyDataItem } from "./lib/type";

declare module "@types/leaflet" {
  /**
   * 飞线Layer
   */
  export class FlyLayer extends _FlyLayer {}

  /**
   * 飞线Layer
   */
  export function flyLayer(data: FlyDataItem[], options: FlyOptions): FlyLayer;
  /**
   * 飞线Layer
   */
  export class MovingMarker extends _MovingMarker {}

  /**
   * 飞线Layer
   */
  export function movingMarker(
    latlngs: L.LatLngExpression[],
    durations: number,
    options: any
  ): MovingMarker;

  export class Marker extends L.Marker {
    setRotationAngle(px1: number, py1: number, px2: number, py2: number) {}
  }
}
