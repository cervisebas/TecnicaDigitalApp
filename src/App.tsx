import React, { createRef, PureComponent } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerNavegation from "./Components/CustomDrawerNavegation";
import Page1 from "./Screens/Page1";
import Page2 from "./Screens/Page2";
import Page3 from "./Screens/Page3";
import Page4 from "./Screens/Page4";
import messaging from '@react-native-firebase/messaging';
import { Button, Dialog, Paragraph, Portal, Provider, Text } from "react-native-paper";
import { DeviceEventEmitter, EmitterSubscription, ToastAndroid } from "react-native";
import { Directive } from "./Scripts/ApiTecnica";
import MainWidget from "./Scripts/MainWidget";
import RNFS from "react-native-fs";
import FastImage from "react-native-fast-image";
import Page5 from "./Screens/Page5";
import Page6 from "./Screens/Page6";
import ImageCropPicker from "react-native-image-crop-picker";
import { ThemeContext } from "./Components/ThemeProvider";
import LoadingComponent from "./Components/LoadingComponent";
import Page7 from "./Screens/Page7";
import { isTempSession } from "./Scripts/ApiTecnica/tempsession";

type IProps = {};
type IState = {
    viewLogOut: boolean;
    viewClearCache: boolean;
    viewNotLogOut: boolean;
};

const Drawer = createDrawerNavigator();

export default class AppAdmin extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            viewLogOut: false,
            viewClearCache: false,
            viewNotLogOut: false
        };
        this.clearNowCache = this.clearNowCache.bind(this);
        this.closeSession = this.closeSession.bind(this);
        this._actionLogOut = this._actionLogOut.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    static contextType = ThemeContext;
    // Ref's
    private refLoadingComponent = createRef<LoadingComponent>();

    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('CloseSessionAdmin', this._actionLogOut);
        this.event2 = DeviceEventEmitter.addListener('ClearNowCache', ()=>this.setState({ viewClearCache: true }));
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event2?.remove();
    }
    async _actionLogOut() {
        const isSessionTemp = await isTempSession();
        if (isSessionTemp) return this.setState({ viewNotLogOut: true });
        this.setState({ viewLogOut: true });
    }
    wait(time: number) {
        return new Promise((resolve)=>setTimeout(resolve, time));
    }
    closeSession() {
        this.setState({ viewLogOut: false }, async()=>{
            this.refLoadingComponent.current?.open('Cerrando sesión...');
            await Directive.closeSession();
            await messaging().unsubscribeFromTopic("directives");
            await MainWidget.init();
            await this.wait(1500);
            this.refLoadingComponent.current?.close();
            DeviceEventEmitter.emit('reVerifySession');
        });
    }
    clearNowCache() {
        this.setState({ viewClearCache: false }, async()=>{
            this.refLoadingComponent.current?.open('Limpiando: 0%');
            try {
                const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.isFile()) await RNFS.unlink(file.path);
                    await this.refLoadingComponent.current?.updateAsync(`Limpiando: ${((i * 100) / files.length).toFixed(0)}%`);
                }
                await FastImage.clearMemoryCache();
                await ImageCropPicker.clean();
                setTimeout(()=>{
                    this.refLoadingComponent.current?.close();
                    ToastAndroid.show('Cache limpiada con éxito.', ToastAndroid.SHORT);
                    DeviceEventEmitter.emit('reloadCacheSize');
                }, 1000);
            } catch {
                this.refLoadingComponent.current?.close();
                ToastAndroid.show('Ocurrió un error al limpiar la cache.', ToastAndroid.SHORT);
            }
        });
    }
    render(): React.ReactNode {
        const { theme } = this.context;
        return(<Provider theme={theme}>
            <Drawer.Navigator initialRouteName="Registros" screenOptions={{ headerShown: false }} drawerContent={(props)=><CustomDrawerNavegation {...props} />}>
                <Drawer.Screen
                    name={"Registros"}
                    component={Page1 as any}
                    options={{ drawerLabel: 'Registros', drawerIcon: 'account-box-multiple' as any }}
                />
                <Drawer.Screen
                    name={"Registros docentes"}
                    component={Page7 as any}
                    options={{ drawerLabel: 'Registros docentes', drawerIcon: 'account-box-multiple-outline' as any }}
                />
                <Drawer.Screen
                    name={"Grupos"}
                    component={Page6 as any}
                    options={{ drawerLabel: 'Grupos', drawerIcon: 'account-group-outline' as any }}
                />
                <Drawer.Screen
                    name={"Horarios"}
                    component={Page2 as any}
                    options={{ drawerLabel: 'Horarios', drawerIcon: 'clock-time-eight-outline' as any }}
                />
                <Drawer.Screen
                    name={"Lista de alumnos"}
                    component={Page3 as any}
                    options={{ drawerLabel: 'Lista de alumnos', drawerIcon: 'format-list-bulleted' as any }}
                />
                <Drawer.Screen
                    name={"Directivos"}
                    component={Page4 as any}
                    options={{ drawerLabel: 'Directivos', drawerIcon: 'shield-crown-outline' as any }}
                />
                <Drawer.Screen
                    name={"Registros de actividad"}
                    component={Page5 as any}
                    options={{ drawerLabel: 'Registros de actividad', drawerIcon: 'folder-text-outline' as any }}
                />
            </Drawer.Navigator>
            <Portal>
                <Dialog visible={this.state.viewLogOut} onDismiss={()=>this.setState({ viewLogOut: false })}>
                    <Dialog.Title>Espere por favor!!!</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>Está a punto de cerrar sesión. ¿Estás seguro que quieres realizar esta acción?</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={()=>this.setState({ viewLogOut: false })}>Cancelar</Button>
                        <Button onPress={this.closeSession}>Aceptar</Button>
                    </Dialog.Actions>
                </Dialog>
                <Dialog visible={this.state.viewClearCache} onDismiss={()=>this.setState({ viewClearCache: false })}>
                    <Dialog.Title>¡¡¡Atención!!!</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph><Text>{"Limpiar los archivos en cache borrara las imágenes de los perfiles de los estudiantes y la de los directivos. Luego realizada esta acción se tendrán que volver a descargar las imágenes cuando sean necesarias.\n\nEsto tardara mucho tiempo. "}<Text style={{ fontWeight: 'bold' }}>Solo realizar esta operación si se necesita realmente.</Text></Text></Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={()=>this.setState({ viewClearCache: false })}>Cancelar</Button>
                        <Button onPress={this.clearNowCache}>Aceptar</Button>
                    </Dialog.Actions>
                </Dialog>
                <Dialog visible={this.state.viewNotLogOut} onDismiss={()=>this.setState({ viewNotLogOut: false })}>
                    <Dialog.Title>No puedes cerrar sesión</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>La sesión iniciada es temporal, para cerrar sesión debes de cerrar y volver a abrir la aplicación para eliminar los datos de la cuenta actual.</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={()=>this.setState({ viewNotLogOut: false })}>Aceptar</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <LoadingComponent ref={this.refLoadingComponent} />
        </Provider>);
    }
}