import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { Clock, Users, MapPin } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrainingItemProps {
    training: any;
    onPress: () => void;
}

export const TrainingItem = ({ training, onPress }: TrainingItemProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme as 'light' | 'dark'];

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <Card style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.timeContainer}>
                        <Clock color={colors.primary} size={16} />
                        <Text style={[styles.timeText, { color: colors.text }]}>
                            {format(new Date(training.startTime), 'HH:mm')}
                        </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>
                            {training.visibility}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>{training.title}</Text>

                <View style={styles.footer}>
                    <View style={styles.infoItem}>
                        <MapPin color={colors.tabIconDefault} size={14} />
                        <Text style={[styles.infoText, { color: colors.tabIconDefault }]} numberOfLines={1}>
                            {training.locationName || 'Local não definido'}
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Users color={colors.tabIconDefault} size={14} />
                        <Text style={[styles.infoText, { color: colors.tabIconDefault }]}>
                            {training.participantCount || 0}
                        </Text>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ADFF2F',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    infoText: {
        fontSize: 12,
    },
});
