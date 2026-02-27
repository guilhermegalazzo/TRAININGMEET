import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { Button } from '../../src/components/Button';
import { useAuth, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const router = useRouter();

    const onSignInPress = async () => {
        try {
            const { createdSessionId, setActive } = await startOAuthFlow();
            if (createdSessionId) {
                setActive!({ session: createdSessionId });
                router.replace('/(tabs)');
            }
        } catch (err) {
            console.error('OAuth error', err);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Text style={[styles.logoText, { color: colors.primary }]}>T</Text>
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: colors.text }]}>TrainingMeet</Text>
                    <Text style={[styles.subtitle, { color: colors.text }]}>
                        Conecte-se. Treine. Evolua. O calendário social para quem não para.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Entrar com Google"
                        onPress={onSignInPress}
                        variant="primary"
                    />
                    <Text style={[styles.terms, { color: colors.tabIconDefault }]}>
                        Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: '#1A1A1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 80,
    },
    logoText: {
        fontSize: 60,
        fontWeight: '900',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        opacity: 0.8,
        paddingHorizontal: 20,
        lineHeight: 26,
    },
    footer: {
        width: '100%',
        marginBottom: 40,
    },
    terms: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 40,
    },
});
