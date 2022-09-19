import React, { PureComponent } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerNavegation from "./Components/CustomDrawerNavegation";
import Page1 from "./Screens/Page1";
import Page2 from "./Screens/Page2";
import Page3 from "./Screens/Page3";
import Page4 from "./Screens/Page4";
import messaging from '@react-native-firebase/messaging';
import { Button, Dialog, Paragraph, Portal, Provider, Text } from "react-native-paper";
import Theme from "./Themes";
import { DeviceEventEmitter, EmitterSubscription, ToastAndroid } from "react-native";
import { Directive } from "./Scripts/ApiTecnica";
import MainWidget from "./Scripts/MainWidget";
import LoadingController from "./Components/loading/loading-controller";
import RNFS from "react-native-fs";
import FastImage from "react-native-fast-image";
import Page5 from "./Screens/Page5";
import Page6 from "./Screens/Page6";
import ImageCropPicker from "react-native-image-crop-picker";

type IProps = {};
type IState = {
    viewLogOut: boolean;
    viewClearCache: boolean;
    showLoading: boolean;
    textLoading: string;
};

const Drawer = createDrawerNavigator();

export default class AppAdmin extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            viewLogOut: false,
            viewClearCache: false,
            showLoading: false,
            textLoading: ''
        };
        this.clearNowCache = this.clearNowCache.bind(this);
        this.closeSession = this.closeSession.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('CloseSessionAdmin', ()=>this.setState({ viewLogOut: true }));
        this.event2 = DeviceEventEmitter.addListener('ClearNowCache', ()=>this.setState({ viewClearCache: true }));
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event2?.remove();
    }
    wait(time: number) {
        return new Promise((resolve)=>setTimeout(resolve, time));
    }
    closeSession() {
        this.setState({ showLoading: true, textLoading: 'Cerrando sesión...', viewLogOut: false }, async()=>{
            await Directive.closeSession();
            await messaging().unsubscribeFromTopic("directives");
            await MainWidget.init();
            await this.wait(1500);
            this.setState({ showLoading: false });
            DeviceEventEmitter.emit('reVerifySession');
        });
    }
    clearNowCache() {
        this.setState({ viewClearCache: false, showLoading: true, textLoading: 'Limpiando: 0%' }, async()=>{
            try {
                const files = await RNFS.readDir(RNFS.CachesDirectoryPath);
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.isFile()) await RNFS.unlink(file.path);
                    this.setState({ textLoading: `Limpiando: ${((i * 100) / files.length).toFixed(0)}%` });
                }
                await FastImage.clearMemoryCache();
                await ImageCropPicker.clean();
                setTimeout(()=>this.setState({ showLoading: false }, ()=>{
                    ToastAndroid.show('Cache limpiada con éxito.', ToastAndroid.SHORT);
                    DeviceEventEmitter.emit('reloadCacheSize');
                }), 1000);
            } catch {
                this.setState({ showLoading: false }, ()=>ToastAndroid.show('Ocurrió un error al limpiar la cache.', ToastAndroid.SHORT));
            }
        });
    }
    render(): React.ReactNode {
        return(<Provider theme={Theme}>
            <Drawer.Navigator initialRouteName="Registros" screenOptions={{ headerShown: false }} drawerContent={(props)=><CustomDrawerNavegation {...props} />}>
                <Drawer.Screen
                    name={"Registros"}
                    component={Page1 as any}
                    options={{ drawerLabel: 'Registros', drawerIcon: 'account-box-multiple' as any }}
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
            </Portal>
            <LoadingController visible={this.state.showLoading} loadingText={this.state.textLoading} indicatorColor={Theme.colors.accent} />
        </Provider>);
    }
}