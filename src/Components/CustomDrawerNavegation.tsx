import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { CommonActions, DrawerActions } from "@react-navigation/native";
import { decode } from "base-64";
import React, { Component, PureComponent, ReactNode } from "react";
import { DeviceEventEmitter, EmitterSubscription, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Avatar, Badge, Drawer, Text, Title } from "react-native-paper";
import { Directive, urlBase } from "../Scripts/ApiTecnica";
import Theme from "../Themes";
import ImageLazyLoad from "./Elements/ImageLazyLoad";
import RNFS from "react-native-fs";

type IState = {
    nameUser: any;
    pictureUser: string;
    loadingUser: boolean;
    widht: number;
    backgroundImage: number;
    sizeCache: string;
};
export default class CustomDrawerNavegation extends PureComponent<DrawerContentComponentProps, IState> {
    constructor(props: DrawerContentComponentProps) {
        super(props);
        this.state = {
            nameUser: 'Cargando...',
            pictureUser: '',
            loadingUser: false,
            widht: 0,
            backgroundImage: require('../Assets/animation-top.gif'),
            sizeCache: '0B'
        };
        this.closeSession = this.closeSession.bind(this);
        this.clearCache = this.clearCache.bind(this);
        this.loadData = this.loadData.bind(this);
        this.changeBackgroundImage = this.changeBackgroundImage.bind(this);
        this.updateSizeCacheFolder = this.updateSizeCacheFolder.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private interval: NodeJS.Timer | null = null;
    private interval2: NodeJS.Timer | null = null;
    private _isMount: boolean = false;
    componentDidMount() {
        this._isMount = true;
        this.event = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.setState({
            nameUser: 'Usuario de pruebas',
            pictureUser: '',
            loadingUser: false
        });
        this.changeBackgroundImage();
        this.interval = setInterval(this.changeBackgroundImage, 120000);
        this.interval2 = setInterval(this.updateSizeCacheFolder, 30000);
        this.updateSizeCacheFolder();
    }
    componentWillUnmount() {
        this._isMount = false;
        this.event?.remove();
        this.event = null;
        clearInterval(this.interval as any);
        clearInterval(this.interval2 as any);
    }
    componentDidUpdate() {
        if (Directive.openSession) if (!this.state.loadingUser) this.loadData();
    }
    changeBackgroundImage() {
        var random = Math.floor(Math.random() * (4 - 0) + 0);
        if (random == 1) return this.setState({ backgroundImage: require('../Assets/animation-top-1.gif') });
        if (random == 2) return this.setState({ backgroundImage: require('../Assets/animation-top-2.gif') });
        if (random == 3) return this.setState({ backgroundImage: require('../Assets/animation-top-3.gif') });
        this.setState({ backgroundImage: require('../Assets/animation-top.gif') });
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
        DeviceEventEmitter.emit('CloseSessionAdmin');
        this.props.navigation.closeDrawer();
    }
    clearCache() {
        DeviceEventEmitter.emit('ClearNowCache');
        this.props.navigation.closeDrawer();
    }
    async updateSizeCacheFolder() {
        try {
            var size = 0;
            var finalSize = 0;
            var convert = true;
            var unit = "B";
            var files = await RNFS.readDir(RNFS.CachesDirectoryPath);
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                size += file.size;
            }
            while (convert) {
                if (parseInt((size / 1000).toFixed(0)) >= 1 && finalSize == 0) {
                    finalSize = size / 1000;
                    unit = 'Kb';
                } else if (parseInt((finalSize / 1000).toFixed(0)) >= 1) {
                    finalSize = (finalSize == 0)? size / 1000: finalSize / 1000;
                    unit = (unit == 'Kb')? 'Mb': 'Gb';
                } else {
                    (finalSize == 0)&&(finalSize = size);
                    convert = false;
                }
            }
            (this._isMount)&&this.setState({ sizeCache: `${finalSize.toFixed(0)}${unit}` });
        } catch {
            (this._isMount)&&this.setState({ sizeCache: '-0B' });
        }
    }
    render(): ReactNode {
        return(<View style={{ flex: 1, position: 'relative' }}>
            <DrawerContentScrollView onLayout={({ nativeEvent })=>this.setState({ widht: nativeEvent.layout.width })} {...this.props} style={{ backgroundColor: Theme.colors.background }}>
                <View style={styles.headerImage}>
                    <FastImage source={this.state.backgroundImage} style={{ width: '100%', height: '100%', opacity: 0.7 }} resizeMode={'cover'} />
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
                    label={'Limpiar cache'}
                    icon={'sd'}
                    right={(props)=><Badge {...props}>{this.state.sizeCache}</Badge>}
                    onPress={this.clearCache}
                />
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