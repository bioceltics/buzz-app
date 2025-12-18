import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    errorMsg: null,
    isLoading: true,
  });

  const requestPermission = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState({
          location: null,
          errorMsg: 'Permission to access location was denied',
          isLoading: false,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState({
        location,
        errorMsg: null,
        isLoading: false,
      });
    } catch (error) {
      setState({
        location: null,
        errorMsg: 'Failed to get location',
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const watchLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return null;
    }

    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 50,
      },
      (location) => {
        setState((prev) => ({
          ...prev,
          location,
        }));
      }
    );
  };

  return {
    ...state,
    requestPermission,
    watchLocation,
  };
}
