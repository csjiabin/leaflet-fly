import { default as L } from 'leaflet';
import { DrawFlyDataItem, FlyDataItem, FlyOptions } from './type';
import { MovingMarker } from './movingMarker';
/**
 * 飞线Layer
 */
declare class FlyLayer extends L.Layer {
    _data: FlyDataItem[];
    _options: FlyOptions;
    /** 平移动画 */
    _posAnimation: L.PosAnimation;
    _lineGroup: L.FeatureGroup<any>;
    _posMarkerGroup: L.FeatureGroup<any>;
    _moveMarkerGroup: L.FeatureGroup<any>;
    _animations: never[];
    _newData: never[];
    _posAnimations: never[];
    constructor(data: FlyDataItem[], options?: FlyOptions);
    onAdd(map: L.Map): this;
    onRemove(): this;
    setData(data: FlyDataItem[]): this;
    setOptions(options?: FlyOptions): this;
    draw(): this;
    clearLine(): this;
    clearMarker(): this;
    drawLine(points?: L.LatLngExpression[], options?: L.PolylineOptions): this;
    drawMarker(data: DrawFlyDataItem[]): this;
    latLngToLayerPoint(latLng: L.LatLngExpression): L.Point;
    start(): this;
    stop(): this;
    _startAnimation(): void;
    _stopAnimation(): void;
}
export { FlyLayer, MovingMarker };
