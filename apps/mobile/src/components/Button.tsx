import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button = ({ title, onPress, variant = 'primary', loading, style, textStyle }: ButtonProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme as 'light' | 'dark'];

    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return { backgroundColor: colors.primary };
            case 'secondary':
                return { backgroundColor: colors.secondary };
            case 'outline':
                return { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'primary':
                return { color: '#000' };
            case 'secondary':
                return { color: '#fff' };
            case 'outline':
                return { color: colors.primary };
            default:
                return { color: '#000' };
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, getButtonStyle(), style]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#000' : colors.primary} />
            ) : (
                <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'SpaceMono', // System font for now
    },
});
