// Mock for react-native-gesture-handler on web
import { View, ScrollView, TouchableOpacity } from 'react-native';

export const GestureHandlerRootView = View;
export const Swipeable = View;
export const DrawerLayout = View;
export const State = {};
export const PanGestureHandler = View;
export const TapGestureHandler = View;
export const FlingGestureHandler = View;
export const LongPressGestureHandler = View;
export const NativeViewGestureHandler = View;
export const PinchGestureHandler = View;
export const RotationGestureHandler = View;
export const RawButton = TouchableOpacity;
export const BaseButton = TouchableOpacity;
export const RectButton = TouchableOpacity;
export const BorderlessButton = TouchableOpacity;
export const FlatList = View;
export const gestureHandlerRootHOC = (Component) => Component;
export const Directions = {};

export default {
  GestureHandlerRootView: View,
  Swipeable: View,
  DrawerLayout: View,
  State: {},
  PanGestureHandler: View,
  TapGestureHandler: View,
  FlingGestureHandler: View,
  LongPressGestureHandler: View,
  NativeViewGestureHandler: View,
  PinchGestureHandler: View,
  RotationGestureHandler: View,
  RawButton: TouchableOpacity,
  BaseButton: TouchableOpacity,
  RectButton: TouchableOpacity,
  BorderlessButton: TouchableOpacity,
  FlatList: View,
  gestureHandlerRootHOC: (Component) => Component,
  Directions: {},
  ScrollView,
};
