import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { CommonActions, DrawerActions } from "@react-navigation/native";
import { decode } from "base-64";
import React, { PureComponent, ReactNode } from "react";
import { DeviceEventEmitter, EmitterSubscription, ScrollView, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Avatar, Badge, overlay, Switch, Text, Title } from "react-native-paper";
import { Drawer } from "./CustomDrawer";
import { Directive, urlBase } from "../Scripts/ApiTecnica";
import ImageLazyLoad from "./Elements/ImageLazyLoad";
import RNFS from "react-native-fs";
import { ThemeContext } from "./ThemeProvider";
import Color from "color";
import { isDateBetween } from "../Scripts/Utils";
// Images
import AnimationTop from "../Assets/DrawerAnims/anim1.webp";
import AnimationTop1 from "../Assets/DrawerAnims/anim2.webp";
import AnimationTop1Dark from "../Assets/DrawerAnims/anim2-dark.webp";
import AnimationTop2 from "../Assets/DrawerAnims/anim3.webp";
import AnimationTop3 from "../Assets/DrawerAnims/anim4.webp";
import HalloweenAnimationTop1 from "../Assets/DrawerAnims/anim5.webp";
import HalloweenAnimationTop2 from "../Assets/DrawerAnims/anim6.webp";
import HalloweenAnimationTop3 from "../Assets/DrawerAnims/anim7.webp";
import HalloweenAnimationTop4 from "../Assets/DrawerAnims/anim8.webp";
import ProfilePicture from "../Assets/profile.webp";
import moment from "moment";
//import ParticleBackground from "./ParticleBackground";

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
    private numImage: number = 0;
    private oldTheme: 'light' | 'dark' = 'light';
    private currentTheme: 'light' | 'dark' = 'light';
    static contextType = ThemeContext;
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
        if (this.oldTheme !== this.currentTheme && this.numImage == 1) this.changeBackgroundImage();
        this.oldTheme = this.currentTheme;
    }
    changeBackgroundImage() {
        const { isDark } = this.context;
        const random = Math.floor(Math.random() * (10 - 0) + 0);
        
        /* ##### Halloween Animations ##### */
        const isHalloween = isDateBetween('20/10', '5/11', moment().format('DD/MM'));
        const startHalloween = Math.floor(Math.random() * (3 - 1) + 1);
        if (isHalloween && startHalloween == 2) return this.changeBackgroundImageHalloween();

        if (random == 3 || random == 4) {
            this.numImage = 2;
            return this.setState({ backgroundImage: AnimationTop2 });
        }
        if (random == 5 || random == 6) {
            this.numImage = 3;
            return this.setState({ backgroundImage: AnimationTop3 });
        }
        if (random == 2) {
            this.numImage = 1;
            return this.setState({ backgroundImage: (isDark)? AnimationTop1Dark: AnimationTop1 });
        }
        this.numImage = 0;
        this.setState({ backgroundImage: AnimationTop });
    }
    changeBackgroundImageHalloween() {
        const random = Math.floor(Math.random() * (11 - 0) + 0);
        if (random >= 1 && random <= 3) {
            this.numImage = 4;
            return this.setState({ backgroundImage: HalloweenAnimationTop1 });
        }
        if (random >= 4 && random <= 7) {
            this.numImage = 5;
            return this.setState({ backgroundImage: HalloweenAnimationTop2 });
        }
        if (random >= 8 && random <= 10) {
            this.numImage = 5;
            return this.setState({ backgroundImage: HalloweenAnimationTop3 });
        }
        return this.setState({ backgroundImage: HalloweenAnimationTop4 });
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
        const { isDark, theme } = this.context;
        this.currentTheme = (isDark)? 'dark': 'light';
        return(<View style={[styles.content, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }]}>
            <View onLayout={({ nativeEvent })=>this.setState({ widht: nativeEvent.layout.width })} {...this.props} style={{ flex: 2 }}>
                <View style={[styles.headerImage, { backgroundColor: theme.colors.background, shadowColor: theme.colors.text }]}>
                    <FastImage source={this.state.backgroundImage} style={styles.fastImage} resizeMode={'cover'} />
                    <View style={styles.contentProfile}>
                        {(!this.state.loadingUser)? <Avatar.Image size={46} source={ProfilePicture} style={{ marginLeft: 12 }} />
                        :<ImageLazyLoad size={46} source={{ uri: this.state.pictureUser }} circle style={{ marginLeft: 12 }} />}
                        <Title numberOfLines={1} style={[styles.profileName, { width: this.state.widht - 78, color: theme.colors.text }]}>{this.state.nameUser}</Title>
                    </View>
                </View>
                <View style={styles.contentScrollView}>
                    {/*<ParticleBackground
                        particleNumber={20}
                        particleSize={12}
                        particleDispersion={32}
                        particleColor={Theme.colors.accent}
                        backgroundColor={"rgba(0, 0, 0, 0)"}
                        containerStyle={styles.backgroundParticles}                        
                    />*/}
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
                                theme={theme}
                                label={(drawerLabel !== undefined)? drawerLabel as string: (title !== undefined)? title: name}
                                icon={drawerIcon as any}
                                active={index == this.props.state.index}
                                onPress={()=>this.props.navigation.dispatch({ ...(index == this.props.state.index)? DrawerActions.closeDrawer(): CommonActions.navigate(name), target: this.props.state.key })}
                            />);
                        })}
                        <ClearCacheItem onPress={this.clearCache} />
                        <ThemeItem />
                        <Drawer.Item
                            theme={theme}
                            label={'Cerrar sesión'}
                            icon={'logout'}
                            onPress={this.closeSession}
                        />
                    </ScrollView>
                </View>
            </View>
            <View style={styles.brandContent}>
                <Text style={[styles.textSubBrand, { color: Color(theme.colors.text).alpha(0.54).rgb().string() }]}>from</Text>
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
    static contextType = ThemeContext;
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
        const { theme } = this.context;
        return(<Drawer.Item
            theme={theme}
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
    static contextType = ThemeContext;
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
        const { theme } = this.context;
        return(<Drawer.Item
            theme={theme}
            label={'Limpiar cache'}
            icon={'sd'}
            right={this._right}
            onPress={this.props.onPress}
        />);
    }
}

type IProps4 = {};
type IState4 = {};

class ThemeItem extends PureComponent<IProps4, IState4> {
    constructor(props: IProps4) {
        super(props);
    }
    static contextType = ThemeContext;
    render(): React.ReactNode {
        const { isDark, theme, setTheme } = this.context;
        return(<Drawer.Item
            theme={theme}
            label={'Tema oscuro'}
            icon={'weather-night'}
            right={()=><Switch
                value={isDark}
                color={theme.colors.primary}
                onChange={setTheme}
            />}
            onPress={setTheme}
        />);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
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
        //color: '#000000'
    },
    backgroundParticles: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        flex: 2
    },
    contentScrollView: {
        position: 'relative',
        overflow: 'hidden',
        flex: 3,
        paddingBottom: 80,
        paddingTop: 8
    },
    headerImage: {
        width: '100%',
        height: 150,
        //backgroundColor: Theme.colors.background,
        position: 'relative',
        marginTop: -4,
        overflow: 'hidden',
        //shadowColor: "#000000",
        shadowOffset:{
            width: 0,
            height: 1
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3
    },
    textSubBrand: {
        //color: '#3a3a3a',
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