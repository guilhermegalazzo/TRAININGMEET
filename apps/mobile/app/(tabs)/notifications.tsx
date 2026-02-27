import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Bell, Heart, UserPlus, Calendar } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

const MOCK_NOTIFS = [
    { id: '1', type: 'LIKE', text: 'Sarah curtiu seu treino de hoje!', time: '2m atrás' },
    { id: '2', type: 'FRIEND', text: 'Ricardo enviou uma solicitação de amizade.', time: '1h atrás' },
    { id: '3', type: 'EVENT', text: 'Lembrete: Yoga ao Amanhecer começa em 30 min.', time: '30m atrás' },
];

export default function NotificationsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme as 'light' | 'dark'];

    const getIcon = (type: string) => {
        switch (type) {
            case 'LIKE': return <Heart color="#FF4444" size={20} />;
            case 'FRIEND': return <UserPlus color={colors.primary} size={20} />;
            case 'EVENT': return <Calendar color={colors.primary} size={20} />;
            default: return <Bell color={colors.primary} size={20} />;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
            </View>

            <FlatList
                data={MOCK_NOTIFS}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.notifItem, { backgroundColor: colors.surface }]}>
                        <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                            {getIcon(item.type)}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.notifText, { color: colors.text }]}>{item.text}</Text>
                            <Text style={[styles.notifTime, { color: colors.tabIconDefault }]}>{item.time}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Bell color={colors.surface} size={80} />
                        <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
                            Tudo limpo por aqui!
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    list: {
        paddingHorizontal: 24,
        gap: 12,
    },
    notifItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        gap: 16,
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    notifTime: {
        fontSize: 12,
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    }
});
