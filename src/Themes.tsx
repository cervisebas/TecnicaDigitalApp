import { DefaultTheme as NavigationLightTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { DefaultTheme as PaperLightTheme, DarkTheme as PaperDarkTheme } from 'react-native-paper';

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


const ThemeLight = {
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
const ThemeDark = {
    ...PaperDarkTheme,
    ...NavigationDarkTheme,
    colors: {
        ...PaperDarkTheme.colors,
        ...NavigationDarkTheme.colors,
        primary: '#FF3232',
        background: '#000000',
        card: '#3dc2ff',
        text: '#FFFFFF',
        surface: '#121212',
        accent: '#3dc2ff',
        onSurface: '#121212'
    },
    dark: true
};

export {
    ThemeLight,
    ThemeDark
};
export default Theme;