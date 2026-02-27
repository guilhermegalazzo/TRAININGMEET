import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import MapView from '../../src/components/MapView';
import { TrainingItem } from '../../src/components/TrainingItem';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../../components/useColorScheme';
import { Map as MapIcon, List as ListIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme as 'light' | 'dark'];
    const router = useRouter();

    // Mock events for exploration
    const events = [
        {
            id: 'e1',
            title: 'Pedal Urbano',
            latitude: -23.5505,
            longitude: -46.6333,
            startTime: new Date().toISOString(),
            locationName: 'Pça da Sé',
            visibility: 'PUBLIC',
            participantCount: 8,
        },
        {
            id: 'e2',
            title: 'HIIT no Parque',
            latitude: -23.5855,
            longitude: -46.6621,
            startTime: new Date().toISOString(),
            locationName: 'Ibirapuera - Portão 7',
            visibility: 'PUBLIC',
            participantCount: 20,
        }
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Explorar</Text>
                <TouchableOpacity
                    style={[styles.toggle, { backgroundColor: colors.surface }]}
                    onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                >
                    {viewMode === 'map' ? (
                        <ListIcon color={colors.primary} size={20} />
                    ) : (
                        <MapIcon color={colors.primary} size={20} />
                    )}
                </TouchableOpacity>
            </View>

            {viewMode === 'map' ? (
                <View style={styles.mapWrapper}>
                    <MapView
                        events={events}
                        onLocationSelect={(lat, lng) => console.log(lat, lng)}
                    />
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TrainingItem
                            training={item}
                            onPress={() => router.push(`/event/${item.id}`)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    toggle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapWrapper: {
        flex: 1,
    },
    listContent: {
        padding: 24,
    },
});
