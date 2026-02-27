import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '');

interface MapViewProps {
    events?: any[];
    onLocationSelect?: (lat: number, lng: number) => void;
    showUserLocation?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ events, onLocationSelect, showUserLocation = true }) => {
    return (
        <View style={styles.container}>
            <Mapbox.MapView
                style={styles.map}
                onPress={(feature) => {
                    if (onLocationSelect) {
                        const [lng, lat] = (feature.geometry as any).coordinates;
                        onLocationSelect(lat, lng);
                    }
                }}
            >
                <Mapbox.Camera
                    zoomLevel={12}
                    centerCoordinate={[-46.6333, -23.5505]} // São Paulo default
                />

                {showUserLocation && <Mapbox.UserLocation />}

                {events?.map((event) => (
                    <Mapbox.PointAnnotation
                        key={event.id}
                        id={event.id}
                        coordinate={[event.longitude, event.latitude]}
                    >
                        <View style={styles.annotationContainer}>
                            <View style={styles.annotationFill} />
                        </View>
                    </Mapbox.PointAnnotation>
                ))}
            </Mapbox.MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    map: {
        flex: 1,
    },
    annotationContainer: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
    },
    annotationFill: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFD700', // TrainingMeet Theme Yellow
        transform: [{ scale: 0.8 }],
    },
});

export default MapView;
