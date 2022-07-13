import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { CommonActions, DrawerActions } from "@react-navigation/native";
import { decode } from "base-64";
import React, { Component, ReactNode } from "react";
import { DeviceEventEmitter, EmitterSubscription, Image, View } from "react-native";
import { Appbar, Avatar, Button, IconButton, Text, Title } from "react-native-paper";
import { Directive, urlBase } from "../Scripts/ApiTecnica";
import MainWidget from "../Scripts/MainWidget";
import Theme from "../Themes";

type IState = {
    nameUser: any;
    pictureUser: string;
    loadingUser: boolean;
    widht: number;
};
export default class CustomDrawerNavegation extends Component<DrawerContentComponentProps, IState> {
    constructor(props: DrawerContentComponentProps) {
        super(props);
        this.state = {
            nameUser: 'Cargando...',
            pictureUser: '',
            loadingUser: false,
            widht: 0
        };
        this.closeSession = this.closeSession.bind(this);
        this.loadData = this.loadData.bind(this);
    }
    private event: EmitterSubscription | undefined = undefined;
    private colors = {
        inactiveTintColor: 'rgba(0, 0, 0, 0.5)',
        inactiveBackgroundColor: 'rgba(255, 255, 255, 0)'
    };
    componentWillUnmount() {
        this.event?.remove();
        this.event = undefined;
        this.setState({
            nameUser: 'Cargando...',
            pictureUser: '',
            loadingUser: false,
            widht: 0
        });
    }
    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.setState({
            nameUser: 'Usuario de pruebas',
            pictureUser: '',
            loadingUser: false
        });
    }
    componentDidUpdate() {
        if (Directive.openSession) if (!this.state.loadingUser) this.loadData();
    }
    transformId(id: string) {
        var str: string = '';
        switch (id.length) {
            case 1:
                str = `000${id}`;
                break;
            case 2:
                str = `00${id}`;
                break;
            case 3:
                str = `0${id}`;
                break;
            default:
                str = id;
                break;
        }
        return str;
    }
    async loadData() {
        var userData = await Directive.getDataLocal();
        this.setState({
            nameUser: `@${decode(userData.username)}`,
            pictureUser: `${urlBase}/image/${decode(userData.picture)}`,
            loadingUser: true
        });
    }
    async closeSession() {
        await Directive.closeSession();
        await MainWidget.init();
        DeviceEventEmitter.emit('reVerifySession');
    }
    render(): ReactNode {
        return(<View style={{ flex: 1, position: 'relative' }}>
            <DrawerContentScrollView onLayout={({ nativeEvent })=>this.setState({ widht: nativeEvent.layout.width })} {...this.props} style={{ backgroundColor: Theme.colors.background }}>
                <View style={{ width: '100%', height: 150, backgroundColor: Theme.colors.background, position: 'relative', marginBottom: 8, marginTop: -4, overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: '#000000' }}>
                    <Image source={require('../Assets/animation-top.gif')} style={{ width: '100%', height: '100%', opacity: 0.7 }} resizeMode={'cover'} />
                    <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', position: 'absolute', bottom: 18, width: '100%' }}>
                        <Avatar.Image size={46} source={(this.state.loadingUser)? { uri: this.state.pictureUser }: require('../Assets/profile.png')} style={{ marginLeft: 12 }} />
                        <Title numberOfLines={1} style={{ marginLeft: 12, width: this.state.widht - 78, color: '#000000' }}>{this.state.nameUser}</Title>
                    </View>
                </View>
                {this.props.state.routes.map((item, index)=>{
                    const { title, drawerLabel, drawerIcon } = this.props.descriptors[item.key].options;
                    return(<DrawerItem
                        key={index}
                        label={(drawerLabel !== undefined)? drawerLabel: (title !== undefined)? title: item.name}
                        icon={drawerIcon}
                        {...this.colors}
                        focused={index == this.props.state.index}
                        onPress={()=>this.props.navigation.dispatch({ ...(index == this.props.state.index)? DrawerActions.closeDrawer(): CommonActions.navigate(item.name), target: this.props.state.key })}
                    />);
                })}
            </DrawerContentScrollView>
            <Appbar style={{ position: 'absolute', bottom: 0, right: 0, left: 0 }}>
                <Appbar.Content title={'Opciones'} />
                <Appbar.Action icon={'logout'} onPress={this.closeSession} />
            </Appbar>
        </View>);
    }
};