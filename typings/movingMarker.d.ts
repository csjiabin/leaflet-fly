import { default as L } from 'leaflet';
declare class MovingMarker extends L.Marker {
    static notStartedState: number;
    static endedState: number;
    static pausedState: number;
    static runState: number;
    _options: {
        autoRotation: boolean;
        autostart: boolean;
        loop: boolean;
    };
    _latlngs: L.LatLng[];
    _durations: number[];
    _state: number;
    _currentDuration: number;
    _currentIndex: number;
    _startTime: number;
    _startTimeStamp: number;
    _pauseStartTime: number;
    _animId: number;
    _animRequested: boolean;
    _currentLine: L.LatLng[];
    _stations: Record<string, number>;
    constructor(latlngs: L.LatLngExpression[], durations: number | number[], options: Record<string, any>);
    isRunning(): boolean;
    isEnded(): boolean;
    isStarted(): boolean;
    isPaused(): boolean;
    start(): void;
    resume(): void;
    pause(): this | undefined;
    stop(elapsedTime?: number): this | undefined;
    addLatLng(latlng: L.LatLngExpression, duration: number): this;
    moveTo(latlng: L.LatLngExpression, duration: number): this;
    addStation(pointIndex: number, duration: number): this | undefined;
    onAdd(map: L.Map): this;
    onRemove(map: L.Map): this;
    _createDurations(latlngs: L.LatLng[], duration: number): number[];
    _startAnimation(): void;
    _resumeAnimation(): void;
    _stopAnimation(): void;
    _updatePosition(): void;
    _loadLine(index: number): void;
    /**
     * Load the line where the marker is
     * @param  {Number} timestamp
     * @return {Number} elapsed time on the current line or null if
     * we reached the end or marker is at a station
     */
    _updateLine(timestamp: number): number | null;
    _animate(timestamp: number, noRequestAnim?: boolean): void;
}
export { MovingMarker };
