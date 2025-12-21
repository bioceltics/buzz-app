// Mock for react-native-maps on web
import { View } from 'react-native';

const MapView = View;
MapView.Marker = View;
MapView.Callout = View;
MapView.Polygon = View;
MapView.Polyline = View;
MapView.Circle = View;

export const Marker = View;
export const Callout = View;
export const Polygon = View;
export const Polyline = View;
export const Circle = View;
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = null;

export default MapView;
