import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Location from 'expo-location';
import { useAuth } from '@clerk/clerk-expo';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export function useLiveLocation(eventId: string) {
    const { getToken } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [othersLocations, setOthersLocations] = useState<Record<string, any>>({});
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | null = null;

        async function setupLive() {
            const token = await getToken();
            if (!token) return;

            const socket = io(BACKEND_URL, {
                auth: { token },
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                socket.emit('joinEventLive', { eventId }, (res: any) => {
                    if (res.status === 'success') {
                        setIsLive(true);
                    }
                });
            });

            socket.on('locationUpdate', (update) => {
                setOthersLocations((prev) => ({
                    ...prev,
                    [update.userId]: update,
                }));
            });

            // Start tracking
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 5,
                },
                (location: Location.LocationObject) => {
                    socket.emit('updateLocation', {
                        eventId,
                        lat: location.coords.latitude,
                        lng: location.coords.longitude,
                    });
                }
            );
        }

        if (eventId) setupLive();

        return () => {
            socketRef.current?.disconnect();
            locationSubscription?.remove();
        };
    }, [eventId]);

    return { othersLocations, isLive };
}
