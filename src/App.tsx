import React, { Component } from "react";
import { Platform, StatusBar, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { getNavigationBarHeight } from 'react-native-android-navbar-height';
import SystemNavigationBar from "react-native-system-navigation-bar";
import SplashScreen from 'react-native-splash-screen';
import DeviceInfo from 'react-native-device-info';
import Theme from "./Themes";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Page1 from "./Screens/Page1";
import Page2 from "./Screens/Page2";
import CustomDrawerNavegation from "./Components/CustomDrawerNavegation";
import Page3 from "./Screens/Page3";
import Others from "./Others";
import RNFS from "react-native-fs";
import Page4 from "./Screens/Page4";
import 'react-native-gesture-handler';
import 'moment/min/locales';

type IProps = {};
type IState = {
    marginAndroid: {
        marginTop: number;
        marginBottom: number;
    };
};

const Drawer = createDrawerNavigator();

export default class App extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            marginAndroid: {
                marginTop: 0,
                marginBottom: 0
            }
        };
    }
    componentDidMount(): void {
        if (Platform.OS == 'android') {
            SplashScreen.hide();
            SystemNavigationBar.setNavigationColor('#FF3232', true);
            DeviceInfo.getApiLevel().then(async(level)=>(level <= 26)&&this.setState({ marginAndroid: { marginTop: StatusBar.currentHeight || 24, marginBottom: await getNavigationBarHeight() } }));
            this.verifyFolder();
        }
    }
    componentWillUnmount() {
        this.setState({
            marginAndroid: {
                marginTop: 0,
                marginBottom: 0
            }
        });
    }
    async verifyFolder() {
        if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`))
            RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`);
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1, ...this.state.marginAndroid }}>
            <StatusBar backgroundColor={'#FF3232'} barStyle={'light-content'} />
            <PaperProvider theme={Theme}>
                <NavigationContainer theme={Theme}>
                    <Drawer.Navigator initialRouteName="Registros" screenOptions={{ headerShown: false }} drawerContent={(props)=><CustomDrawerNavegation {...props} />}>
                        <Drawer.Screen
                            name="Registros"
                            component={Page1}
                            options={{ drawerLabel: 'Registros', drawerIcon: (props)=><Icon {...props} name={'account-box-multiple'} /> }}
                        />
                        <Drawer.Screen
                            name="Horarios"
                            component={Page2}
                            options={{ drawerLabel: 'Horarios', drawerIcon: (props)=><Icon {...props} name={'clock-time-eight-outline'} /> }}
                        />
                        <Drawer.Screen
                            name="Lista de alumnos"
                            component={Page3}
                            options={{ drawerLabel: 'Lista de alumnos', drawerIcon: (props)=><Icon {...props} name={'format-list-bulleted'} /> }}
                        />
                        <Drawer.Screen
                            name="Directivos"
                            component={Page4}
                            options={{ drawerLabel: 'Directivos', drawerIcon: (props)=><Icon {...props} name={'shield-crown-outline'} /> }}
                        />
                    </Drawer.Navigator>
                </NavigationContainer>
                <Others />
            </PaperProvider>
        </View>);
    }
}