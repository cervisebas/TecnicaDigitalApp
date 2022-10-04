import { NativeModules } from "react-native";

const { ThemeMode } = NativeModules;

export default new class AppThemeMode {
    constructor() {}
    set(theme: 'default' | 'dark'): void {
        try {
            ThemeMode.set(theme);            
        } catch {
            return;
        }
    }
    get(): Promise<'default' | 'dark'> {
        return new Promise((resolve)=>{
            try {
                ThemeMode
                    .get((result: 'default' | 'dark')=>resolve(result));
            } catch {
                resolve('default');
            }
        });
    }
    update(): void {
        ThemeMode.update();
    }
}