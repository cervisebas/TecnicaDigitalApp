import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { CommonActions, DrawerActions } from "@react-navigation/native";
import { decode } from "base-64";
import React, { Component, ReactNode } from "react";
import { DeviceEventEmitter, EmitterSubscription, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Avatar, Drawer, Text, Title } from "react-native-paper";
import { Directive, urlBase } from "../Scripts/ApiTecnica";
import MainWidget from "../Scripts/MainWidget";
import Theme from "../Themes";
import ImageLazyLoad from "./Elements/ImageLazyLoad";

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
        this.props.navigation.closeDrawer();
        DeviceEventEmitter.emit('reVerifySession');
    }
    render(): ReactNode {
        return(<View style={{ flex: 1, position: 'relative' }}>
            <DrawerContentScrollView onLayout={({ nativeEvent })=>this.setState({ widht: nativeEvent.layout.width })} {...this.props} style={{ backgroundColor: Theme.colors.background }}>
                <View style={styles.headerImage}>
                    <FastImage source={require('../Assets/animation-top.gif')} style={{ width: '100%', height: '100%', opacity: 0.7 }} resizeMode={'cover'} />
                    <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', position: 'absolute', bottom: 18, width: '100%' }}>
                        {(!this.state.loadingUser)? <Avatar.Image size={46} source={require('../Assets/profile.png')} style={{ marginLeft: 12 }} />
                        :<ImageLazyLoad size={46} source={{ uri: this.state.pictureUser }} circle style={{ marginLeft: 12 }} />}
                        <Title numberOfLines={1} style={{ marginLeft: 12, width: this.state.widht - 78, color: '#000000' }}>{this.state.nameUser}</Title>
                    </View>
                </View>
                {this.props.state.routes.map(({ key, name }, index)=>{
                    const { title, drawerLabel, drawerIcon } = this.props.descriptors[key].options;
                    return(<Drawer.Item
                        key={index}
                        label={(drawerLabel !== undefined)? drawerLabel as string: (title !== undefined)? title: name}
                        icon={drawerIcon as any}
                        active={index == this.props.state.index}
                        onPress={()=>this.props.navigation.dispatch({ ...(index == this.props.state.index)? DrawerActions.closeDrawer(): CommonActions.navigate(name), target: this.props.state.key })}
                    />);
                })}
                <Drawer.Item
                    label={'Cerrar sesión'}
                    icon={'logout'}
                    onPress={this.closeSession}
                />
            </DrawerContentScrollView>
            <View style={{ position: 'absolute', bottom: 0, right: 0, left: 0, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Text style={styles.textSubBrand}>from</Text>
                <Text style={styles.textBrand}>SCAPPS</Text>
            </View>
        </View>);
    }
};

const styles = StyleSheet.create({
    headerImage: {
        width: '100%',
        height: 150,
        backgroundColor: Theme.colors.background,
        position: 'relative',
        marginBottom: 8,
        marginTop: -4,
        overflow: 'hidden',
        shadowColor: "#000000",
        shadowOffset:{
            width: 0,
            height: 1
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3
    },
    textSubBrand: {
        color: '#3a3a3a',
        fontWeight: 'normal',
        fontSize: 13
    },
    textBrand: {
        color: '#FF2E2E',
        fontSize: 18,
        fontFamily: 'Organetto-Bold'
    }
});