import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { Search, UserPlus, MessageCircle } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

const MOCK_FRIENDS = [
    { id: '1', name: 'Ricardo Silva', status: 'Treinando agora', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Mariana Costa', status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'João Victor', status: 'Treinando agora', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', name: 'Ana Paula', status: 'Offline', avatar: 'https://i.pravatar.cc/150?u=4' },
];

export default function FriendsScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme as 'light' | 'dark'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Amigos</Text>
                <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
                    <UserPlus color="#000" size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                    <Search color={colors.tabIconDefault} size={20} />
                    <TextInput
                        placeholder="Buscar amigos..."
                        placeholderTextColor={colors.tabIconDefault}
                        style={[styles.searchInput, { color: colors.text }]}
                    />
                </View>
            </View>

            <FlatList
                data={MOCK_FRIENDS}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={[styles.friendItem, { backgroundColor: colors.surface }]}>
                        <View style={styles.friendInfo}>
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                            <View>
                                <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                                <Text style={[styles.status, { color: item.status === 'Treinando agora' ? colors.primary : colors.tabIconDefault }]}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.chatButton}>
                            <MessageCircle color={colors.primary} size={24} />
                        </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    list: {
        paddingHorizontal: 24,
        gap: 12,
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    status: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    chatButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
