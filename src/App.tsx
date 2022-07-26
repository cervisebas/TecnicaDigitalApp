import React, { Component } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerNavegation from "./Components/CustomDrawerNavegation";
import Page1 from "./Screens/Page1";
import Page2 from "./Screens/Page2";
import Page3 from "./Screens/Page3";
import Page4 from "./Screens/Page4";
import { Button, Dialog, Paragraph, Portal, Provider } from "react-native-paper";
import Theme from "./Themes";
import { DeviceEventEmitter, EmitterSubscription } from "react-native";
import { Directive } from "./Scripts/ApiTecnica";
import MainWidget from "./Scripts/MainWidget";

type IProps = {};
type IState = {
    viewLogOut: boolean;
};

const Drawer = createDrawerNavigator();

export default class AppAdmin extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            viewLogOut: false
        };
    }
    private event: EmitterSubscription | null = null;
    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('CloseSessionAdmin', ()=>this.setState({ viewLogOut: true }));
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event = null;
    }
    async closeSession() {
        await Directive.closeSession();
        await MainWidget.init();
        DeviceEventEmitter.emit('reVerifySession');
    }
    render(): React.ReactNode {
        return(<Provider theme={Theme}>
            <Drawer.Navigator initialRouteName="Registros" screenOptions={{ headerShown: false }} drawerContent={(props)=><CustomDrawerNavegation {...props} />}>
                <Drawer.Screen
                    name="Registros"
                    component={Page1}
                    options={{ drawerLabel: 'Registros', drawerIcon: 'account-box-multiple' as any }}
                />
                <Drawer.Screen
                    name="Horarios"
                    component={Page2}
                    options={{ drawerLabel: 'Horarios', drawerIcon: 'clock-time-eight-outline' as any }}
                />
                <Drawer.Screen
                    name="Lista de alumnos"
                    component={Page3}
                    options={{ drawerLabel: 'Lista de alumnos', drawerIcon: 'format-list-bulleted' as any }}
                />
                <Drawer.Screen
                    name="Directivos"
                    component={Page4}
                    options={{ drawerLabel: 'Directivos', drawerIcon: 'shield-crown-outline' as any }}
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
            </Portal>
        </Provider>);
    }
}