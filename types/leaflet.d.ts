declare module 'leaflet' {
  export type LatLngTuple = [number, number];
  export interface LatLngLiteral {
    lat: number;
    lng: number;
  }
  export type LatLngExpression = LatLngTuple | LatLngLiteral;
  export interface LatLngBounds {
    isValid(): boolean;
  }

  export type LatLngBoundsExpression =
    | [LatLngExpression, LatLngExpression]
    | LatLngExpression[]
    | LatLngBounds;

  export interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
    zoomControl?: boolean;
    scrollWheelZoom?: boolean | 'center';
    inertia?: boolean;
    zoomAnimation?: boolean;
    fadeAnimation?: boolean;
    preferCanvas?: boolean;
    minZoom?: number;
    maxZoom?: number;
    maxBounds?: LatLngBoundsExpression;
  }

  export interface FitBoundsOptions {
    padding?: number | [number, number];
    animate?: boolean;
  }

  export interface ViewOptions {
    animate?: boolean;
  }

  export interface Layer {
    addTo(map: Map): this;
    remove(): this;
  }

  export interface InteractiveLayer extends Layer {
    on(event: string, handler: (...args: any[]) => void): this;
  }

  export interface Renderer extends Layer {}

  export interface CircleMarkerOptions {
    renderer?: Renderer;
    radius?: number;
    color?: string;
    weight?: number;
    fillOpacity?: number;
    fillColor?: string;
    className?: string;
  }

  export interface RectangleOptions {
    pane?: string;
    color?: string;
    weight?: number;
    fillOpacity?: number;
  }

  export class Map {
    constructor(element: HTMLElement | string, options?: MapOptions);
    remove(): void;
    setView(center: LatLngExpression, zoom?: number, options?: ViewOptions): this;
    fitBounds(bounds: LatLngBoundsExpression, options?: FitBoundsOptions): this;
    setMinZoom(zoom: number): this;
    setMaxZoom(zoom: number): this;
    getZoom(): number;
    setMaxBounds(bounds: LatLngBoundsExpression): this;
    getPane(name: string): HTMLElement | undefined;
    createPane(name: string): HTMLElement;
    invalidateSize(options?: boolean | ViewOptions): this;
    options: MapOptions & { maxBoundsViscosity?: number };
  }

  export function map(element: HTMLElement | string, options?: MapOptions): Map;
  export function tileLayer(urlTemplate: string, options?: Record<string, any>): InteractiveLayer;
  export function rectangle(bounds: LatLngBoundsExpression, options?: RectangleOptions): Layer;
  export function svg(): Renderer;
  export function latLngBounds(bounds: LatLngBoundsExpression): LatLngBounds;
  export function latLngBounds(southWest: LatLngExpression, northEast: LatLngExpression): LatLngBounds;
  export function circleMarker(latlng: LatLngExpression, options?: CircleMarkerOptions): InteractiveLayer;

  export interface MarkerClusterGroupOptions {
    showCoverageOnHover?: boolean;
    spiderfyOnMaxZoom?: boolean;
    zoomToBoundsOnClick?: boolean;
    disableClusteringAtZoom?: number;
    animate?: boolean;
  }

  export interface MarkerClusterGroup extends InteractiveLayer {
    clearLayers(): this;
    addLayer(layer: Layer): this;
  }

  export function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
