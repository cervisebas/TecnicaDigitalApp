import React, { Component, PureComponent } from "react";
import { FlatList, ImageSourcePropType, LayoutChangeEvent, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, StyleProp, StyleSheet, TouchableHighlight, View, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FastImage from "react-native-fast-image";
import { Appbar, Banner, overlay } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../Components/ThemeProvider";
import CustomModal from "../Components/CustomModal";
import Theme from "../Themes";
// Images
import Design1 from "../Assets/Examples/design1.webp";
import Design2 from "../Assets/Examples/design2.webp";
import Design3 from "../Assets/Examples/design3.webp";
import Design4 from "../Assets/Examples/design4.webp";
import Design5 from "../Assets/Examples/design5.webp";
import Design6 from "../Assets/Examples/design6.webp";
import Design7 from "../Assets/Examples/design7.webp";
import Design8 from "../Assets/Examples/design8.webp";
import Design9 from "../Assets/Examples/design9.webp";
import Design10 from "../Assets/Examples/design10.webp";
import Design11 from "../Assets/Examples/design11.webp";
import Design12 from "../Assets/Examples/design12.webp";
import Design13 from "../Assets/Examples/design13.webp";
import Design14 from "../Assets/Examples/design14.webp";
import Design15 from "../Assets/Examples/design15.webp";
import Design16 from "../Assets/Examples/design16.webp";
import Design17 from "../Assets/Examples/design17.webp";
import Design18 from "../Assets/Examples/design18.webp";
import Design19 from "../Assets/Examples/design19.webp";
import Design20 from "../Assets/Examples/design20.webp";
import Design21 from "../Assets/Examples/design21.webp";
import Design22 from "../Assets/Examples/design22.webp";
import Design23 from "../Assets/Examples/design23.webp";
import Design24 from "../Assets/Examples/design24.webp";
import Design25 from "../Assets/Examples/design25.webp";
import Design26 from "../Assets/Examples/design26.webp";
import Design27 from "../Assets/Examples/design27.webp";
import Design28 from "../Assets/Examples/design28.webp";
import Design29 from "../Assets/Examples/design29.webp";

type IProps = {
    onChange: (option: number | undefined)=>any;
    isFamily?: boolean;
};
type IState = {
    visible: boolean;
    width: number;
    bannerVisible: boolean;
};

type Item = {
    id: number;
    source: ImageSourcePropType;
    option: number | undefined;
};

export default class ChangeCardDesign extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            width: 0,
            bannerVisible: false
        };
        this._renderItem = this._renderItem.bind(this);
        this._onLayout = this._onLayout.bind(this);
        this._showBanner = this._showBanner.bind(this);
        this._hideBanner = this._hideBanner.bind(this);
        this._onScroll = this._onScroll.bind(this);
        this.close = this.close.bind(this);
    }
    private list: Item[] = [
        { id: 1, source: Design1, option: undefined },
        { id: 2, source: Design2, option: 1 },
        { id: 3, source: Design4, option: 2 },
        { id: 4, source: Design3, option: 3 },
        { id: 5, source: Design5, option: 4 },
        { id: 6, source: Design6, option: 5 },
        { id: 7, source: Design7, option: 6 },
        { id: 8, source: Design8, option: 7 },
        { id: 9, source: Design9, option: 8 },
        { id: 10, source: Design10, option: 9 },
        { id: 11, source: Design11, option: 10 },
        { id: 12, source: Design12, option: 11 },
        { id: 13, source: Design13, option: 12 },
        { id: 14, source: Design14, option: 13 },
        { id: 15, source: Design15, option: 14 },
        { id: 16, source: Design16, option: 15 },
        { id: 17, source: Design17, option: 16 },
        { id: 18, source: Design18, option: 17 },
        { id: 19, source: Design19, option: 18 },
        { id: 20, source: Design20, option: 19 },
        { id: 21, source: Design21, option: 20 },
        { id: 22, source: Design22, option: 21 },
        { id: 23, source: Design23, option: 22 },
        { id: 24, source: Design24, option: 23 },
        { id: 25, source: Design25, option: 24 },
        { id: 26, source: Design26, option: 25 },
        { id: 27, source: Design27, option: 26 },
        { id: 28, source: Design28, option: 27 },
        { id: 29, source: Design29, option: 28 }
    ];
    private backupList = this.list;
    private bannerCloseOnEvent: boolean = false;
    private delimiters: number[] = [5, 23];
    static contextType = ThemeContext;

    componentDidMount(): void {
        if (this.props.isFamily)
            AsyncStorage.getItem('is-now-visible-banner-family')
                .then((value)=>(value == null)&&this.setState({ bannerVisible: true }));
    }
    _keyExtractor(item: Item) {
        return `card-desing-${item.id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<Item>) {
        return(<CardImages
            key={`card-desing-${item.id}`}
            width={this.state.width}
            styles={styles.itemsCards}
            source={item.source}
            onPress={()=>{
                this.props.onChange(item.option);
                this.close();
            }}
        />);
    }

    _onLayout({ nativeEvent }: LayoutChangeEvent) {
        this.setState({
            width: nativeEvent.layout.width
        });
    }
    _showBanner() {
        this.setState({ bannerVisible: true });
    }
    _hideBanner() {
        this.setState({ bannerVisible: false });
        AsyncStorage.setItem('is-now-visible-banner-family', '1');
    }
    checkVip(isVip: boolean) {
        if (!isVip) {
            if (this.list.find((v)=>v.option == 5) == undefined) return;
            this.list = this.list.filter((v)=>!this.delimiters.find((d)=>d == v.option));
            return this.forceUpdate();
        }
        if (this.list.find((v)=>v.option == 5) == undefined) {
            this.list = this.backupList;
            return this.forceUpdate();
        }
    }
    _onScroll({ nativeEvent: { contentOffset } }: NativeSyntheticEvent<NativeScrollEvent>) {
        if (this.props.isFamily) {
            if (this.state.bannerVisible && contentOffset.y > 150) {
                this.bannerCloseOnEvent = true;
                this.setState({ bannerVisible: false });
            } else if (this.bannerCloseOnEvent && contentOffset.y < 100) {
                this.bannerCloseOnEvent = false;
                this.setState({ bannerVisible: true });
            }
        }
    }

    // Controller
    open(isVip?: boolean) {
        this.checkVip(!!isVip);
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} style={{ padding: 16 }} animationIn={'fadeInUp'} animationOut={'fadeOutDown'} onRequestClose={this.close}>
            <View onLayout={this._onLayout} style={[styles.contain, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }]}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={'Lista de diseños'} />
                    {(!this.state.bannerVisible && this.props.isFamily)&&<Appbar.Action icon={'information-outline'} onPress={this._showBanner} />}
                </Appbar.Header>
                <Banner
                    visible={this.state.bannerVisible}
                    actions={[{ label: 'ENTENDIDO', onPress: this._hideBanner }]}
                    icon={({ size })=><Icon name={"information-outline"} size={size} color={theme.colors.text} />}
                    children={'El diseño que elijas se mantendrá colocado, aunque reinicies o cierres la aplicación.'}
                />
                <View style={{ flex: 2 }}>
                    {(this.state.width !== 0)&&<FlatList
                        data={this.list}
                        contentContainerStyle={{ paddingTop: 12 }}
                        onScroll={this._onScroll}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />}
                </View>
            </View>
        </CustomModal>);
    }
}

type IProps2 = {
    source: ImageSourcePropType;
    width: number;
    styles?: StyleProp<ViewStyle>;
    onPress?: ()=>any;
};
type IState2 = {
    width: number;
    height: number;
};
class CardImages extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            width: 0,
            height: 0
        };
    }
    static contextType = ThemeContext;
    componentDidMount() {
        var isFind = false;
        var useScale = 0.001;
        while (!isFind) {
            if (((3600 * useScale) > (this.props.width - 24)) && this.state.width == 0) {
                this.setState({ width: 3600 * useScale, height: 2337 * useScale });
                isFind = true;
            } else {
                useScale += 0.001;
            }
        }
    }
    render(): React.ReactNode {
        const { theme } = this.context;
        return(<TouchableHighlight
            style={[styles.imageContain, this.props.styles, { height: this.state.height, width: this.state.width }]}
            onPress={(this.props.onPress)&&this.props.onPress}>
            <FastImage
                source={this.props.source as any}
                resizeMode={'cover'}
                style={[styles.fastImageItem, { borderColor: theme.colors.text }]}
            />
        </TouchableHighlight>);
    }
}

const styles = StyleSheet.create({
    contain: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        overflow: 'hidden',
        borderRadius: 8
    },
    imageContain: {
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        maxHeight: 300,
        alignItems: 'center',
        justifyContent: 'center'
    },
    itemsCards: {
        marginTop: 0,
        marginBottom: 12,
        marginLeft: 12,
        marginRight: 12
    },
    fastImageItem: {
        borderWidth: 2,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 8
    }
});