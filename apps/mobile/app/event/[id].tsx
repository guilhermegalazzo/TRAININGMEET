import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { ChevronLeft, Calendar, Clock, MapPin, Users, Share2, MessageSquare } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme as 'light' | 'dark'];

    // Mock data for detail
    const event = {
        id,
        title: 'Treino de Velocidade',
        description: 'Treino focado em explosão e sprints. Aberto a todos os níveis, mas esteja preparado para suar! Vamos fazer séries de 400m e 200m.',
        startTime: new Date().toISOString(),
        locationName: 'Pista de Atletismo Ibirapuera',
        latitude: -23.5855,
        longitude: -46.6621,
        participantCount: 12,
        maxParticipants: 20,
        creator: {
            name: 'Sarah M.',
            avatar: 'https://i.pravatar.cc/150?u=sarah',
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Header Image / Map Preview */}
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
                    <MapPin color={colors.primary} size={40} />
                </View>

                <SafeAreaView style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.background + '80' }]}
                        onPress={() => router.back()}
                    >
                        <ChevronLeft color={colors.text} size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: colors.background + '80' }]}
                    >
                        <Share2 color={colors.text} size={20} />
                    </TouchableOpacity>
                </SafeAreaView>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>

                    <View style={styles.organizerRow}>
                        <Image source={{ uri: event.creator.avatar }} style={styles.avatar} />
                        <Text style={[styles.organizerText, { color: colors.tabIconDefault }]}>
                            Organizado por <Text style={{ color: colors.text, fontWeight: '700' }}>{event.creator.name}</Text>
                        </Text>
                    </View>

                    <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.infoItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                <Calendar color={colors.primary} size={20} />
                            </View>
                            <View>
                                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Data</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>
                                    {format(new Date(event.startTime), "d 'de' MMMM", { locale: ptBR })}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                <Clock color={colors.primary} size={20} />
                            </View>
                            <View>
                                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Horário</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>
                                    {format(new Date(event.startTime), 'HH:mm')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                                <MapPin color={colors.primary} size={20} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.infoLabel, { color: colors.tabIconDefault }]}>Local</Text>
                                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                                    {event.locationName}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Sobre o treino</Text>
                    <Text style={[styles.description, { color: colors.text }]}>
                        {event.description}
                    </Text>

                    <View style={styles.participantRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Participantes</Text>
                        <Text style={[styles.participantCount, { color: colors.primary }]}>
                            {event.participantCount}/{event.maxParticipants}
                        </Text>
                    </View>

                    {/* Avatar Stack Mockup */}
                    <View style={styles.avatarStack}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Image
                                key={i}
                                source={{ uri: `https://i.pravatar.cc/150?u=${i}` }}
                                style={[styles.stackAvatar, { borderColor: colors.background, marginLeft: i === 1 ? 0 : -12 }]}
                            />
                        ))}
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.surface }]}>
                <TouchableOpacity
                    style={[styles.chatButton, { backgroundColor: colors.surface }]}
                    onPress={() => console.log('Open Chat')}
                >
                    <MessageSquare color={colors.primary} size={24} />
                </TouchableOpacity>

                <Button
                    title="Confirmar Presença"
                    onPress={() => console.log('RSVP')}
                    style={{ flex: 1 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imagePlaceholder: {
        height: 300,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 24,
        marginTop: -30,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: 'inherit', // Handled by container
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 16,
    },
    organizerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    organizerText: {
        fontSize: 14,
    },
    infoCard: {
        borderRadius: 24,
        padding: 20,
        gap: 20,
        marginBottom: 32,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        opacity: 0.8,
        marginBottom: 32,
    },
    participantRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    participantCount: {
        fontSize: 16,
        fontWeight: '800',
    },
    avatarStack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stackAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        flexDirection: 'row',
        gap: 16,
        borderTopWidth: 1,
    },
    chatButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
