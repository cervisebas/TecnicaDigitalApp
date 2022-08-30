import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { CommonActions, DrawerActions } from "@react-navigation/native";
import { decode } from "base-64";
import React, { PureComponent, ReactNode } from "react";
import { DeviceEventEmitter, EmitterSubscription, ScrollView, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Avatar, Badge, Text, Title } from "react-native-paper";
import { Drawer } from "./CustomDrawer";
import { Directive, urlBase } from "../Scripts/ApiTecnica";
import Theme from "../Themes";
import ImageLazyLoad from "./Elements/ImageLazyLoad";
import RNFS from "react-native-fs";
// Images
import AnimationTop from "../Assets/animation-top.gif";
import AnimationTop1 from "../Assets/animation-top-1.gif";
import AnimationTop2 from "../Assets/animation-top-2.gif";
import AnimationTop3 from "../Assets/animation-top-3.gif";
import ProfilePicture from "../Assets/profile.png";

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
            backgroundImage: AnimationTop,
            sizeCache: '0B'
        };
        this.closeSession = this.closeSession.bind(this);
        this.clearCache = this.clearCache.bind(this);
        this.loadData = this.loadData.bind(this);
        this.changeBackgroundImage = this.changeBackgroundImage.bind(this);
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
    }
    componentWillUnmount() {
        this._isMount = false;
        this.event?.remove();
        clearInterval(this.interval!);
        clearInterval(this.interval2!);
    }
    componentDidUpdate() {
        if (Directive.openSession) if (!this.state.loadingUser) this.loadData();
    }
    changeBackgroundImage() {
        var random = Math.floor(Math.random() * (7 - 0) + 0);
        if (random == 2 || random == 4) return this.setState({ backgroundImage: AnimationTop2 });
        if (random == 3 || random == 6) return this.setState({ backgroundImage: AnimationTop3 });
        if (random == 5) return this.setState({ backgroundImage: AnimationTop1 });
        this.setState({ backgroundImage: AnimationTop });
    }
    async loadData() {
        var userData = await Directive.getDataLocal();
        (this._isMount)&&this.setState({
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
    render(): ReactNode {
        return(<View style={styles.content}>
            <View onLayout={({ nativeEvent })=>this.setState({ widht: nativeEvent.layout.width })} {...this.props} style={{ flex: 2 }}>
                <View style={styles.headerImage}>
                    <FastImage source={this.state.backgroundImage} style={styles.fastImage} resizeMode={'cover'} />
                    <View style={styles.contentProfile}>
                        {(!this.state.loadingUser)? <Avatar.Image size={46} source={ProfilePicture} style={{ marginLeft: 12 }} />
                        :<ImageLazyLoad size={46} source={{ uri: this.state.pictureUser }} circle style={{ marginLeft: 12 }} />}
                        <Title numberOfLines={1} style={[styles.profileName, { width: this.state.widht - 78 }]}>{this.state.nameUser}</Title>
                    </View>
                </View>
                <View style={styles.contentScrollView}>
                    <ScrollView>
                        {this.props.state.routes.map(({ key, name }, index)=>{
                            const { title, drawerLabel, drawerIcon } = this.props.descriptors[key].options;
                            if (drawerLabel == 'Registros') return(<ItemRegist
                                key={index}
                                active={index == this.props.state.index}
                                onPress={()=>this.props.navigation.dispatch({ ...(index == this.props.state.index)? DrawerActions.closeDrawer(): CommonActions.navigate(name), target: this.props.state.key })}
                            />);
                            return(<Drawer.Item
                                key={index}
                                label={(drawerLabel !== undefined)? drawerLabel as string: (title !== undefined)? title: name}
                                icon={drawerIcon as any}
                                active={index == this.props.state.index}
                                onPress={()=>this.props.navigation.dispatch({ ...(index == this.props.state.index)? DrawerActions.closeDrawer(): CommonActions.navigate(name), target: this.props.state.key })}
                            />);
                        })}
                        <ClearCacheItem onPress={this.clearCache} />
                        <Drawer.Item
                            label={'Cerrar sesión'}
                            icon={'logout'}
                            onPress={this.closeSession}
                        />
                    </ScrollView>
                </View>
            </View>
            <View style={styles.brandContent}>
                <Text style={styles.textSubBrand}>from</Text>
                <Text style={styles.textBrand}>SCAPPS</Text>
            </View>
        </View>);
    }
};

type IProps3 = {
    active: boolean;
    onPress: ()=>any;
};
type IState3 = {
    count: string;
};

class ItemRegist extends PureComponent<IProps3, IState3> {
    constructor(props: any) {
        super(props);
        this.state = {
            count: '...'
        };
        this._right = this._right.bind(this);
        this.updateBadge = this.updateBadge.bind(this);
    }
    private event: EmitterSubscription | undefined = undefined;
    private isMount: boolean = false;
    componentDidMount(): void {
        this.isMount = true;
        this.event = DeviceEventEmitter.addListener('update-regist-count', this.updateBadge);
    }
    componentWillUnmount(): void {
        this.isMount = false;
        this.event?.remove();
    }
    updateBadge(count: string) {
        if (this.isMount) this.setState({ count });
    }
    _right(props: { color: string; }) {
        return(<Badge {...props} style={(this.state.count == '0')? { display: 'none' }: undefined}>{this.state.count}</Badge>);
    }
    render(): React.ReactNode {
        return(<Drawer.Item
            label={'Registros'}
            icon={'account-box-multiple'}
            right={this._right}
            active={this.props.active}
            onPress={this.props.onPress}
        />);
    }
}

type IProps2 = {
    onPress: ()=>any;
};
type IState2 = {
    sizeCache: string;
};

class ClearCacheItem extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            sizeCache: '0B'
        };
        this._right = this._right.bind(this);
    }
    private _isMount: boolean = false;
    componentDidMount(): void {
        this._isMount = true;
        this.startNow();
    }
    componentWillUnmount(): void {
        this._isMount = false;
    }
    async startNow() {
        while (this._isMount) {
            await this.updateSizeCacheFolder();
            await this.waitTime(2500);
        }
    }
    waitTime(time: number) {
        return new Promise(async(resolve: any)=>setTimeout(resolve, time));
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
            const sizeCache = `${finalSize.toFixed(0)}${unit}`;
            if (this._isMount) if (sizeCache !== this.state.sizeCache) this.setState({ sizeCache });
        } catch {
            (this._isMount)&&this.setState({ sizeCache: '-0B' });
        }
    }
    _right(props: { color: string; }) {
        return(<Badge {...props}>{this.state.sizeCache}</Badge>);
    }
    render(): React.ReactNode {
        return(<Drawer.Item
            label={'Limpiar cache'}
            icon={'sd'}
            right={this._right}
            onPress={this.props.onPress}
        />);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        position: 'relative',
        backgroundColor: Theme.colors.background
    },
    fastImage: {
        width: '100%',
        height: '100%',
        opacity: 0.7
    },
    contentProfile: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        position: 'absolute',
        bottom: 18,
        width: '100%'
    },
    profileName: {
        marginLeft: 12,
        color: '#000000'
    },
    contentScrollView: {
        flex: 3,
        paddingBottom: 80
    },
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
    },
    brandContent: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20
    }
});