import { createContext, useEffect, useState } from "react";
import { ThemeDark, ThemeLight } from "../Themes";
import AppThemeMode from "../Scripts/ThemeMode";

type IProps = { children: React.ReactNode; };

const ThemeContext = createContext({
    isDark: false,
    theme: ThemeLight,
    desing: 'SAO',
    setTheme: ()=>{},
    setDesing: ()=>{}
});

function ThemeProvider(props: IProps) {
    const [isDark, setIsDark] = useState(false);
    const [theme, setDefaultTheme] = useState(ThemeLight);
    const [desing, setDefaultDesing] = useState<'Default' | 'SAO'>('Default');

    const setTheme = ()=>{
        if (isDark) {
            setIsDark(false);
            setDefaultTheme(ThemeLight);
            AppThemeMode.set('default');
            AppThemeMode.update();
            return;
        }
        setIsDark(true);
        setDefaultTheme(ThemeDark);
        AppThemeMode.set('dark');
        AppThemeMode.update();
    };
    const setDesing = ()=>{
        if (desing == 'SAO') return setDefaultDesing('Default');
        setDefaultDesing('SAO');
    };

    useEffect(()=>{
        (async()=>{
            const isDarkSave = await AppThemeMode.get();
            if (isDarkSave == "dark") {
                setIsDark(true);
                setDefaultTheme(ThemeDark);
            }
        })();
    }, []);

    return(<ThemeContext.Provider value={{ isDark, theme, desing, setTheme, setDesing }}>
        {props.children}
    </ThemeContext.Provider>);
}

export default ThemeProvider;
export { ThemeContext };