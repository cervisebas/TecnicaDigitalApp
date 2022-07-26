import { DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { DefaultTheme as PaperLightTheme } from 'react-native-paper';

const Theme = {
    ...PaperLightTheme,
    ...NavigationLightTheme,
    colors: {
        ...PaperLightTheme.colors,
        ...NavigationLightTheme.colors,
        primary: '#FF3232',
        background: '#FFFFFF',
        card: '#3dc2ff',
        text: '#000000',
        surface: '#FFFFFF',
        accent: '#3dc2ff',
        onSurface: '#FFFFFF'
    },
    dark: false
};
export default Theme;