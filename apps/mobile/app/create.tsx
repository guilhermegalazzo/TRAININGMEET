import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../src/components/Button';
import { X, Calendar as CalendarIcon, Clock, MapPin, Type, AlignLeft, Users as UsersIcon } from 'lucide-react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '../components/useColorScheme';
import { useRouter } from 'expo-router';

export default function CreateEventScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme as 'light' | 'dark'];

    const [form, setForm] = useState({
        title: '',
        description: '',
        maxParticipants: '10',
        visibility: 'PUBLIC' as 'PUBLIC' | 'FRIENDS' | 'PRIVATE',
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <X color={colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Novo Treino</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.section}>
                        <View style={styles.inputLabelRow}>
                            <Type color={colors.primary} size={16} />
                            <Text style={[styles.label, { color: colors.tabIconDefault }]}>Título do Treino</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            placeholder="Ex: Corrida Matinal, Yoga Flow..."
                            placeholderTextColor={colors.tabIconDefault}
                            value={form.title}
                            onChangeText={(t) => setForm({ ...form, title: t })}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.inputLabelRow}>
                            <AlignLeft color={colors.primary} size={16} />
                            <Text style={[styles.label, { color: colors.tabIconDefault }]}>Descrição</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, height: 100, paddingTop: 16 }]}
                            placeholder="O que vamos treinar?"
                            placeholderTextColor={colors.tabIconDefault}
                            multiline
                            value={form.description}
                            onChangeText={(t) => setForm({ ...form, description: t })}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.section, { flex: 1 }]}>
                            <View style={styles.inputLabelRow}>
                                <CalendarIcon color={colors.primary} size={16} />
                                <Text style={[styles.label, { color: colors.tabIconDefault }]}>Data</Text>
                            </View>
                            <TouchableOpacity style={[styles.input, { backgroundColor: colors.surface, justifyContent: 'center' }]}>
                                <Text style={{ color: colors.text }}>15 de Outubro</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.section, { flex: 1 }]}>
                            <View style={styles.inputLabelRow}>
                                <Clock color={colors.primary} size={16} />
                                <Text style={[styles.label, { color: colors.tabIconDefault }]}>Horário</Text>
                            </View>
                            <TouchableOpacity style={[styles.input, { backgroundColor: colors.surface, justifyContent: 'center' }]}>
                                <Text style={{ color: colors.text }}>07:30</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.inputLabelRow}>
                            <MapPin color={colors.primary} size={16} />
                            <Text style={[styles.label, { color: colors.tabIconDefault }]}>Localização</Text>
                        </View>
                        <TouchableOpacity style={[styles.input, { backgroundColor: colors.surface, justifyContent: 'center' }]}>
                            <Text style={{ color: colors.tabIconDefault }}>Selecionar no mapa...</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.inputLabelRow}>
                            <UsersIcon color={colors.primary} size={16} />
                            <Text style={[styles.label, { color: colors.tabIconDefault }]}>Vagas Máximas</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                            keyboardType="numeric"
                            value={form.maxParticipants}
                            onChangeText={(t) => setForm({ ...form, maxParticipants: t })}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: colors.tabIconDefault, marginBottom: 12 }]}>Visibilidade</Text>
                        <View style={styles.visibilityToggle}>
                            {(['PUBLIC', 'FRIENDS', 'PRIVATE'] as const).map((v) => (
                                <TouchableOpacity
                                    key={v}
                                    style={[
                                        styles.vOption,
                                        { backgroundColor: form.visibility === v ? colors.primary : colors.surface }
                                    ]}
                                    onPress={() => setForm({ ...form, visibility: v })}
                                >
                                    <Text style={{
                                        color: form.visibility === v ? '#000' : colors.text,
                                        fontWeight: '700',
                                        fontSize: 12,
                                    }}>{v}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        title="Criar Evento"
                        onPress={() => {
                            console.log('Create Event', form);
                            router.back();
                        }}
                        variant="primary"
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 0,
    },
    section: {
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    inputLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    visibilityToggle: {
        flexDirection: 'row',
        gap: 8,
    },
    vOption: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
});
