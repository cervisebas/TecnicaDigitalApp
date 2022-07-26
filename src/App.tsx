import React, { Component } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomDrawerNavegation from "./Components/CustomDrawerNavegation";
import Page1 from "./Screens/Page1";
import Page2 from "./Screens/Page2";
import Page3 from "./Screens/Page3";
import Page4 from "./Screens/Page4";

type IProps = {};
type IState = {};

const Drawer = createDrawerNavigator();

export default class AppAdmin extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        return(<Drawer.Navigator initialRouteName="Registros" screenOptions={{ headerShown: false }} drawerContent={(props)=><CustomDrawerNavegation {...props} />}>
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
        </Drawer.Navigator>);
    }
}