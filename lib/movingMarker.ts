import L from "leaflet";
import { isArray, isUndefined, merge } from "lodash";
import { interpolatePosition } from "./utils";

(function () {
  // save these original methods before they are overwritten
  // @ts-ignore
  let proto_initIcon = L.Marker.prototype._initIcon;
  // @ts-ignore
  let proto_setPos = L.Marker.prototype._setPos;

  let oldIE = L.DomUtil.TRANSFORM === "msTransform";

  L.Marker.addInitHook(function () {
    // @ts-ignore
    let iconOptions = this.options.icon && this.options.icon.options;
    // @ts-ignore
    let iconAnchor = iconOptions && this.options.icon.options.iconAnchor;
    if (iconAnchor) {
      iconAnchor = `${iconAnchor[0]}px ${iconAnchor[1]}px`;
    }
    // @ts-ignore
    this.options.rotationOrigin =
      // @ts-ignore
      this.options.rotationOrigin || iconAnchor || "center center"; //设置旋转中心
    // @ts-ignore
    this.options.rotationAngle = this.options.rotationAngle || 0;

    // Ensure marker keeps rotated during dragging
    // @ts-ignore
    this.on("drag", (e: any) => {
      e.target._applyRotation();
    });
  });

  L.Marker.include({
    _initIcon() {
      proto_initIcon.call(this);
    },

    _setPos(pos: any) {
      proto_setPos.call(this, pos);
      this._applyRotation();
    },

    _applyRotation() {
      if (this.options.rotationAngle) {
        this._icon.style[`${L.DomUtil.TRANSFORM}Origin`] =
          this.options.rotationOrigin;

        if (oldIE) {
          // for IE 9, use the 2D rotation
          this._icon.style[
            L.DomUtil.TRANSFORM
          ] = `rotate(${this.options.rotationAngle}deg)`;
        } else {
          // for modern browsers, prefer the 3D accelerated version
          this._icon.style[
            L.DomUtil.TRANSFORM
          ] += ` rotateZ(${this.options.rotationAngle}deg)`;
        }
      }
    },
    /**
     * 设置旋转角度
     */
    setRotationAngle(
      px1: number,
      py1: number,
      px2: number,
      py2: number
    ): L.Marker {
      let x = px2 - px1;
      let y = py2 - py1;
      let hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      //斜边长度
      let cos = x / hypotenuse;
      let radian = Math.acos(cos);
      //求出弧度
      let angle = 180 / (Math.PI / radian);
      //用弧度算出角度
      if (y < 0) {
        angle = -angle;
      } else if (y == 0 && x < 0) {
        angle = 180;
      }
      this.options.rotationAngle = angle;
      this.update();
      return this;
    },

    setRotationOrigin(origin: string) {
      this.options.rotationOrigin = origin;
      this.update();
      return this;
    },
  });
})();

class MovingMarker extends L.Marker {
  static notStartedState = 0;
  static endedState = 1;
  static pausedState = 2;
  static runState = 3;

  _options = {
    autoRotation: true,
    autostart: false,
    loop: false,
  };

  _latlngs: L.LatLng[] = [];

  _durations: number[] = [];

  _state = MovingMarker.notStartedState;

  _currentDuration = 0;
  _currentIndex = 0;

  _startTime = 0;
  _startTimeStamp = 0; // timestamp given by requestAnimFrame
  _pauseStartTime = 0;
  _animId = 0;
  _animRequested = false;
  _currentLine: L.LatLng[] = [];
  _stations: Record<string, number> = {};

  constructor(
    latlngs: L.LatLngExpression[],
    durations: number | number[],
    options: Record<string, any>
  ) {
    let latlng = latlngs[0];
    super(latlng, options);
    this._options = merge(this._options, options);
    // @ts-ignore
    L.Marker.prototype.initialize.call(this, latlng, this._options);

    this._latlngs = latlngs.map((e) => L.latLng(e));

    if (isArray(durations)) {
      this._durations = durations;
    } else {
      this._durations = this._createDurations(this._latlngs, durations);
    }
  }

  isRunning() {
    return this._state === MovingMarker.runState;
  }

  isEnded() {
    return this._state === MovingMarker.endedState;
  }

  isStarted() {
    return this._state !== MovingMarker.notStartedState;
  }

  isPaused() {
    return this._state === MovingMarker.pausedState;
  }

  start() {
    if (this.isRunning()) {
      return;
    }

    if (this.isPaused()) {
      this.resume();
    } else {
      this._loadLine(0);
      this._startAnimation();
      this.fire("start");
    }
  }

  resume() {
    if (!this.isPaused()) {
      return;
    }
    // update the current line
    this._currentLine[0] = this.getLatLng();
    this._currentDuration -= this._pauseStartTime - this._startTime;
    this._startAnimation();
  }

  pause() {
    if (!this.isRunning()) {
      return;
    }

    this._pauseStartTime = Date.now();
    this._state = MovingMarker.pausedState;
    this._stopAnimation();
    this._updatePosition();
    return this;
  }

  stop(elapsedTime?: number) {
    if (this.isEnded()) {
      return;
    }

    this._stopAnimation();

    if (isUndefined(elapsedTime)) {
      // user call
      elapsedTime = 0;
      this._updatePosition();
    }

    this._state = MovingMarker.endedState;
    this.fire("end", { elapsedTime });
    return this;
  }

  addLatLng(latlng: L.LatLngExpression, duration: number) {
    this._latlngs.push(L.latLng(latlng));
    this._durations.push(duration);
    return this;
  }

  moveTo(latlng: L.LatLngExpression, duration: number) {
    this._stopAnimation();
    this._latlngs = [this.getLatLng(), L.latLng(latlng)];
    this._durations = [duration];
    this._state = MovingMarker.notStartedState;
    this.start();
    this._options.loop = false;
    return this;
  }

  addStation(pointIndex: number, duration: number) {
    if (pointIndex > this._latlngs.length - 2 || pointIndex < 1) {
      return;
    }
    this._stations[pointIndex] = duration;
    return this;
  }

  onAdd(map: L.Map) {
    L.Marker.prototype.onAdd.call(this, map);

    if (this._options.autostart && !this.isStarted()) {
      this.start();
      return this;
    }

    if (this.isRunning()) {
      this._resumeAnimation();
    }
    return this;
  }

  onRemove(map: L.Map) {
    L.Marker.prototype.onRemove.call(this, map);
    this._stopAnimation();
    return this;
  }

  _createDurations(latlngs: L.LatLng[], duration: number) {
    let lastIndex = latlngs.length - 1;
    let distances = [];
    let totalDistance = 0;
    let distance = 0;

    // compute array of distances between points
    for (let i = 0; i < lastIndex; i++) {
      distance = latlngs[i + 1].distanceTo(latlngs[i]);
      distances.push(distance);
      totalDistance += distance;
    }

    let ratioDuration = duration / totalDistance;

    let durations = [];
    for (let i = 0; i < distances.length; i++) {
      durations.push(distances[i] * ratioDuration);
    }

    return durations;
  }

  _startAnimation() {
    this._state = MovingMarker.runState;
    this._animId = L.Util.requestAnimFrame(
      (timestamp) => {
        this._startTime = Date.now();
        this._startTimeStamp = timestamp;
        this._animate(timestamp);
      },
      this,
      true
    );
    this._animRequested = true;
  }

  _resumeAnimation() {
    if (!this._animRequested) {
      this._animRequested = true;
      this._animId = L.Util.requestAnimFrame(
        (timestamp) => {
          this._animate(timestamp);
        },
        this,
        true
      );
    }
  }

  _stopAnimation() {
    if (this._animRequested) {
      L.Util.cancelAnimFrame(this._animId);
      this._animRequested = false;
    }
  }

  _updatePosition() {
    let elapsedTime = Date.now() - this._startTime;
    this._animate(this._startTimeStamp + elapsedTime, true);
  }

  _loadLine(index: number) {
    this._currentIndex = index;
    this._currentDuration = this._durations[index];
    this._currentLine = this._latlngs.slice(index, index + 2);
  }

  /**
   * Load the line where the marker is
   * @param  {Number} timestamp
   * @return {Number} elapsed time on the current line or null if
   * we reached the end or marker is at a station
   */
  _updateLine(timestamp: number) {
    // time elapsed since the last latlng
    let elapsedTime = timestamp - this._startTimeStamp;

    // not enough time to update the line
    if (elapsedTime <= this._currentDuration) {
      return elapsedTime;
    }

    let lineIndex = this._currentIndex;
    let lineDuration = this._currentDuration;
    let stationDuration;

    while (elapsedTime > lineDuration) {
      // substract time of the current line
      elapsedTime -= lineDuration;
      stationDuration = this._stations[lineIndex + 1];

      // test if there is a station at the end of the line
      if (stationDuration !== undefined) {
        if (elapsedTime < stationDuration) {
          this.setLatLng(this._latlngs[lineIndex + 1]);
          return null;
        }
        elapsedTime -= stationDuration;
      }

      lineIndex++;

      // test if we have reached the end of the polyline
      if (lineIndex >= this._latlngs.length - 1) {
        if (this._options.loop) {
          lineIndex = 0;
          this.fire("loop", { elapsedTime });
        } else {
          // place the marker at the end, else it would be at
          // the last position
          this.setLatLng(this._latlngs[this._latlngs.length - 1]);
          this.stop(elapsedTime);
          return null;
        }
      }
      lineDuration = this._durations[lineIndex];
    }

    this._loadLine(lineIndex);
    this._startTimeStamp = timestamp - elapsedTime;
    this._startTime = Date.now() - elapsedTime;
    return elapsedTime;
  }

  _animate(timestamp: number, noRequestAnim?: boolean) {
    this._animRequested = false;

    // find the next line and compute the new elapsedTime
    let elapsedTime = this._updateLine(timestamp);

    if (this.isEnded()) {
      // no need to animate
      return;
    }

    if (elapsedTime != null) {
      // compute the position
      let p = interpolatePosition(
        this._currentLine[0],
        this._currentLine[1],
        this._currentDuration,
        elapsedTime
      );
      this.setLatLng(p);
      if (this._options.autoRotation) {
        //为标识设置下次运动时的角度
        // @ts-ignore
        this.setRotationAngle(
          this._currentLine[0].lat,
          this._currentLine[0].lng,
          this._currentLine[1].lat,
          this._currentLine[1].lng
        );
      }
    }

    if (!noRequestAnim) {
      this._animId = L.Util.requestAnimFrame(this._animate, this, false);
      this._animRequested = true;
    }
  }
}

// @ts-ignore
if (!L.movingMarker) {
  // @ts-ignore
  L.movingMarker = (
    latlngs: L.LatLngExpression[],
    durations: number | number[],
    options: Record<string, any>
  ) => {
    return new MovingMarker(latlngs, durations, options);
  };
}

export { MovingMarker };
