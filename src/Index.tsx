import React, { Component } from "react";
import { DeviceEventEmitter, EmitterSubscription, EventEmitter, Platform, StatusBar, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { getNavigationBarHeight } from 'react-native-android-navbar-height';
import SystemNavigationBar from "react-native-system-navigation-bar";
import SplashScreen from 'react-native-splash-screen';
import DeviceInfo from 'react-native-device-info';
import Theme from "./Themes";
import { NavigationContainer, NavigationContainerRef, StackActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Others from "./Others";
import RNFS from "react-native-fs";
import 'react-native-gesture-handler';
import 'moment/min/locales';
import AppAdmin from "./App2";
import AppFamily from "./Family/App";
import { Actions } from "./Scripts/ApiTecnica";

type IProps = {};
type IState = {
    marginAndroid: {
        marginTop: number;
        marginBottom: number;
    };
};

const Stack = createNativeStackNavigator();

export default class Index extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            marginAndroid: {
                marginTop: 0,
                marginBottom: 0
            }
        };
        this.changePage = this.changePage.bind(this);
    }
    private refNavigate: NavigationContainerRef<ReactNavigation.RootParamList> | null = null;
    private event1 : EmitterSubscription | null = null;
    componentDidMount(): void {
        if (Platform.OS == 'android') {
            SplashScreen.hide();
            SystemNavigationBar.setNavigationColor('#FF3232', true);
            DeviceInfo.getApiLevel().then(async(level)=>(level <= 26)&&this.setState({ marginAndroid: { marginTop: StatusBar.currentHeight || 24, marginBottom: await getNavigationBarHeight() } }));
            this.verifyFolder();
        }
        this.event1 = DeviceEventEmitter.addListener('ChangeIndexNavigation', this.changePage);
    }
    changePage(namePage: string) {
        const replaceAction = StackActions.replace(namePage);
        this.refNavigate?.dispatch(replaceAction);
    }
    componentWillUnmount() {
        this.setState({
            marginAndroid: {
                marginTop: 0,
                marginBottom: 0
            }
        });
        this.event1?.remove();
        this.event1 = null;
    }
    async verifyFolder() {
        if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`))
            RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`);
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1, ...this.state.marginAndroid }}>
            <StatusBar backgroundColor={'#FF3232'} barStyle={'light-content'} />
            <PaperProvider theme={Theme}>
                <NavigationContainer ref={(ref)=>this.refNavigate = ref} theme={Theme}>
                    <Stack.Navigator initialRouteName={'Admin'} screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Admin" component={AppAdmin} />
                        <Stack.Screen name="Family" component={AppFamily} />
                    </Stack.Navigator>
                </NavigationContainer>
                <Others />
            </PaperProvider>
        </View>);
    }
}