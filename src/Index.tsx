import React, { Component, createRef } from "react";
import { DeviceEventEmitter, EmitterSubscription, Platform, StatusBar, View } from "react-native";
import { NavigationContainer, NavigationContainerRef, StackActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import { getNavigationBarHeight } from 'react-native-android-navbar-height';
import SystemNavigationBar from "react-native-system-navigation-bar";
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import SplashScreen from 'react-native-splash-screen';
import DeviceInfo from 'react-native-device-info';
import notifee from '@notifee/react-native';
import RNFS from "react-native-fs";
import Theme from "./Themes";
import Others from "./Others";
import AppAdmin from "./App";
import AppFamily from "./Family/App";
import 'react-native-gesture-handler';
import 'moment/min/locales';
import MainWidget from "./Scripts/MainWidget";
import UpdateCheck from "./UpdateCheck";

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
        this.onMessageReceived = this.onMessageReceived.bind(this);
        this._goCheckUpdate = this._goCheckUpdate.bind(this);
    }
    private refNavigate = createRef<NavigationContainerRef<ReactNavigation.RootParamList>>();
    private refUpdateCheck = createRef<UpdateCheck>();
    private event1 : EmitterSubscription | null = null;
    componentDidMount(): void {
        this.event1 = DeviceEventEmitter.addListener('ChangeIndexNavigation', this.changePage);
        if (Platform.OS == 'android') {
            SplashScreen.hide();
            SystemNavigationBar.setNavigationColor('#FF3232', true);
            DeviceInfo.getApiLevel().then(async(level)=>(level <= 26)&&this.setState({ marginAndroid: { marginTop: StatusBar.currentHeight || 24, marginBottom: await getNavigationBarHeight() } }));
            this.verifyFolder();
        }
        this.startNotifications();
    }
    componentDidUpdate() {
        MainWidget.init();
    }
    componentWillUnmount() {
        this.event1?.remove();
        this.event1 = null;
    }
    async startNotifications() {
        messaging().onMessage(this.onMessageReceived);
        messaging().subscribeToTopic('All');
    }
    async onMessageReceived(message: FirebaseMessagingTypes.RemoteMessage) {
        var codeName: number = Math.floor(Math.random() * (99999 - 10000)) + 10000;
        const channelId = await notifee.createChannel({ id: 'default', name: 'Canal por defecto' });
        await notifee.displayNotification({
            id: codeName.toString(),
            title: message.notification!.title,
            body: message.notification!.body,
            android: {
                channelId,
                smallIcon: 'small_icon_notify',
                color: '#FF3232'
            }
        });
    }
    changePage(namePage: string) {
        const replaceAction = StackActions.replace(namePage);
        this.refNavigate.current?.dispatch(replaceAction);
    }
    async verifyFolder() {
        if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`))
            RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`);
    }
    _goCheckUpdate() {
        this.refUpdateCheck.current?.checkUpdateNow();
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1, ...this.state.marginAndroid }}>
            <StatusBar backgroundColor={'#FF3232'} barStyle={'light-content'} />
            <PaperProvider theme={Theme}>
                <NavigationContainer ref={this.refNavigate} theme={Theme}>
                    <Stack.Navigator initialRouteName={'Default'} screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Admin" component={AppAdmin} />
                        <Stack.Screen name="Family" component={AppFamily} />
                        <Stack.Screen name="Default" component={Default} />
                    </Stack.Navigator>
                </NavigationContainer>
                <UpdateCheck ref={this.refUpdateCheck} />
                <Others goCheckUpdate={this._goCheckUpdate} />
            </PaperProvider>
        </View>);
    }
}

class Default extends Component {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View></View>);
    }
}