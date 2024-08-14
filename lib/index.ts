import { isFunction, merge } from "lodash";
import L from "leaflet";
import type { DrawFlyDataItem, FlyDataItem, FlyOptions } from "./type";
import { DEFAULT_OPTIONS } from "./const";
import { getPoints, calcDistance } from "./utils";
import { MovingMarker } from "./movingMarker";
/**
 * 飞线Layer
 */
class FlyLayer extends L.Layer {
  _data: FlyDataItem[] = [];
  _options: FlyOptions = DEFAULT_OPTIONS;

  /** 平移动画 */
  _posAnimation = new L.PosAnimation();
  _lineGroup = L.featureGroup();
  _posMarkerGroup = L.featureGroup();
  _moveMarkerGroup = L.featureGroup();
  _animations = [];
  _newData = [];
  _posAnimations = [];

  constructor(data: FlyDataItem[], options: FlyOptions = DEFAULT_OPTIONS) {
    super();
    this._data = data;
    this._options = merge(DEFAULT_OPTIONS, options);
    L.setOptions(this, this._options);
  }

  onAdd(map: L.Map) {
    this._map = map;
    this._lineGroup.addTo(map);
    this._posMarkerGroup.addTo(map);
    this._moveMarkerGroup.addTo(map);
    this.draw();
    return this;
  }

  onRemove() {
    this._lineGroup.remove();
    this._posMarkerGroup.remove();
    this._moveMarkerGroup.remove();
    // this._map = null;
    return this;
  }
  setData(data: FlyDataItem[]) {
    this._data = data;
    this.draw();
    return this;
  }

  setOptions(options: FlyOptions = {}) {
    this._options = merge(DEFAULT_OPTIONS, options);
    L.setOptions(this, this._options);
    this.draw();
    return this;
  }

  draw() {
    this.clearLine();
    this.clearMarker();
    const { line, marker } = this._options;
    let newData: DrawFlyDataItem[] = [];
    for (const item of this._data) {
      let fromLatlng = L.latLng(item.from);
      let toLatlng = L.latLng(item.to);
      let distance = calcDistance(
        fromLatlng.lat,
        fromLatlng.lng,
        toLatlng.lat,
        toLatlng.lng
      );
      let count = Math.round(distance / 8);
      let points = [
        [fromLatlng.lng, fromLatlng.lat],
        ...getPoints(
          fromLatlng.lng,
          fromLatlng.lat,
          toLatlng.lng,
          toLatlng.lat,
          count,
          0.9
        ),
        [toLatlng.lng, toLatlng.lat],
      ].map((v) => L.latLng([v[1], v[0]]));
      this.drawLine(points, merge(line, item.options?.line));
      newData.push({
        labels: item.labels,
        data: item,
        options: merge(
          marker,
          item.options?.marker
        ) as DrawFlyDataItem["options"],
        from: fromLatlng,
        to: toLatlng,
        points,
        distance,
      });
    }
    this.drawMarker(newData);
    return this;
  }

  clearLine() {
    this._lineGroup.clearLayers();
    return this;
  }
  clearMarker() {
    this._posMarkerGroup.clearLayers();
    this._moveMarkerGroup.clearLayers();
    return this;
  }

  drawLine(points: L.LatLngExpression[] = [], options?: L.PolylineOptions) {
    let polyline = L.polyline(points, options);
    this._lineGroup.addLayer(polyline);
    return this;
  }

  drawMarker(data: DrawFlyDataItem[]) {
    for (const item of data) {
      let { formIcon, toIcon, moveIcon, autoMove, duration, ...options } =
        item.options || {};
      let _formIcon = isFunction(formIcon) ? formIcon(item) : formIcon;
      let _toIcon = isFunction(toIcon) ? toIcon(item) : toIcon;
      let formMarker = L.marker(item.from, {
        icon: _formIcon,
        ...options,
      });

      let toMarker = L.marker(item.to, {
        icon: _toIcon,
        ...options,
      });
      formMarker.on("click", (e) => {
        this.fire("click", e);
      });
      toMarker.on("click", (e) => {
        this.fire("click", e);
      });
      this._posMarkerGroup.addLayer(formMarker);
      this._posMarkerGroup.addLayer(toMarker);
      let _moveIcon = isFunction(moveIcon) ? moveIcon(item) : moveIcon;
      // let moveMarker = L.marker(item.form, { icon: _moveIcon, ...options, attrs: item });
      let moveMarker = new MovingMarker(
        item.points,
        (duration as number) * item.points.length,
        {
          icon: _moveIcon,
          autostart: autoMove,
          ...options,
          attrs: item,
        }
      );
      this._moveMarkerGroup.addLayer(moveMarker as L.Marker);
    }
    if (this._options.marker?.autoMove) {
      this.start();
    }
    return this;
  }

  latLngToLayerPoint(latLng: L.LatLngExpression) {
    return this._map.latLngToLayerPoint(latLng);
  }

  start() {
    this._startAnimation();
    // 监听 'ready' 事件
    return this;
  }
  stop() {
    this._stopAnimation();
    return this;
  }

  _startAnimation() {
    let markers = this._moveMarkerGroup.getLayers() as MovingMarker[];
    for (const marker of markers) {
      marker.on("end", () => {
        // console.log("1", 1, marker);
      });
      marker.start();
    }
  }
  _stopAnimation() {
    let markers = this._moveMarkerGroup.getLayers() as MovingMarker[];
    for (const marker of markers) {
      marker.stop();
    }
  }
}

// @ts-ignore
L.FlyLayer = FlyLayer;

// @ts-ignore
if (!L.flyLayer) {
  // @ts-ignore
  L.flyLayer = (data: FlyDataItem[], options: FlyOptions) =>
    new FlyLayer(data, options);
}
export { FlyLayer, MovingMarker };
