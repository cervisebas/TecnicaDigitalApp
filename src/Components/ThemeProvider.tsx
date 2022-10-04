import { createContext, useEffect, useState } from "react";
import { ThemeDark, ThemeLight } from "../Themes";
import AppThemeMode from "../Scripts/ThemeMode";

type IProps = { children: React.ReactNode; };

const ThemeContext = createContext({
    isDark: false,
    theme: ThemeLight,
    setTheme: ()=>{}
});

function ThemeProvider(props: IProps) {
    const [isDark, setIsDark] = useState(false);
    const [theme, setDefaultTheme] = useState(ThemeLight);

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

    useEffect(()=>{
        (async()=>{
            const isDarkSave = await AppThemeMode.get();
            if (isDarkSave == "dark") {
                setIsDark(true);
                setDefaultTheme(ThemeDark);
            }
        })();
    }, []);

    return(<ThemeContext.Provider value={{ isDark, theme, setTheme }}>
        {props.children}
    </ThemeContext.Provider>);
}

export default ThemeProvider;
export { ThemeContext };