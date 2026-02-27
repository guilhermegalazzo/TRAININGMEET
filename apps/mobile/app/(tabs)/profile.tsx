import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { Button } from '../../src/components/Button';
import { Settings, LogOut, ChevronRight, Award, History, Heart } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

export default function ProfileScreen() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme as 'light' | 'dark'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Minha Conta</Text>
                    <TouchableOpacity>
                        <Settings color={colors.text} size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: user?.imageUrl || 'https://i.pravatar.cc/150' }}
                        style={styles.avatar}
                    />
                    <Text style={[styles.name, { color: colors.text }]}>{user?.fullName || 'Atleta TrainingMeet'}</Text>
                    <Text style={[styles.email, { color: colors.tabIconDefault }]}>{user?.primaryEmailAddress?.emailAddress}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>24</Text>
                        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Treinos</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>152</Text>
                        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Amigos</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.statValue, { color: colors.primary }]}>12</Text>
                        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>Badges</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
                        <View style={styles.menuLeft}>
                            <History color={colors.primary} size={20} />
                            <Text style={[styles.menuText, { color: colors.text }]}>Histórico de Atividades</Text>
                        </View>
                        <ChevronRight color={colors.tabIconDefault} size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
                        <View style={styles.menuLeft}>
                            <Award color={colors.primary} size={20} />
                            <Text style={[styles.menuText, { color: colors.text }]}>Minhas Conquistas</Text>
                        </View>
                        <ChevronRight color={colors.tabIconDefault} size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
                        <View style={styles.menuLeft}>
                            <Heart color={colors.primary} size={20} />
                            <Text style={[styles.menuText, { color: colors.text }]}>Meus Favoritos</Text>
                        </View>
                        <ChevronRight color={colors.tabIconDefault} size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Sair da Conta"
                        onPress={() => signOut()}
                        variant="outline"
                        style={{ borderColor: colors.error }}
                        textStyle={{ color: colors.error }}
                    />
                </View>
            </ScrollView>
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
        fontSize: 24,
        fontWeight: '900',
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#ADFF2F',
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
    },
    email: {
        fontSize: 14,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 32,
    },
    statItem: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '900',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    menuContainer: {
        paddingHorizontal: 24,
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        padding: 24,
        marginTop: 20,
        marginBottom: 40,
    }
});
