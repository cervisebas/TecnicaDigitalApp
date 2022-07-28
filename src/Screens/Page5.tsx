import React, { Component, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, ToastAndroid, View } from "react-native";
import { ActivityIndicator, Appbar, Colors, Divider, IconButton, List, Menu, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Records } from "../Scripts/ApiTecnica";
import { RecordData } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import { decode } from "base-64";
import { decode as utf8decode } from "utf8";
import ViewDetailsRecord from "../Pages/ViewDetailsRecord";

const useUtf8 = (string: string)=>{
    try {
        return utf8decode(string);
    } catch {
        return string;
    }
};

type IProps = {
    navigation: any;
};
type IState = {
    datas: RecordData[];
    actualDatas: RecordData[];
    isLoading: boolean;
    isError: boolean;
    isRefresh: boolean;
    messageError: string;
    viewDetails: boolean;
    viewDetailsData: RecordData | undefined;
    menuVisible: boolean;
    filterActive: 'upward' | 'falling' | 'normal';
};

export default class Page5 extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            datas: [],
            actualDatas: [],
            isLoading: true,
            isError: false,
            isRefresh: false,
            messageError: '',
            viewDetails: false,
            viewDetailsData: undefined,
            menuVisible: false,
            filterActive: 'normal'
        };
        this.loadData = this.loadData.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._filterAsc = this._filterAsc.bind(this);
        this._filterDesc = this._filterDesc.bind(this);
        this._filterNormal = this._filterNormal.bind(this);
        this._closeMenu = this._closeMenu.bind(this);
    }
    private event: EmitterSubscription | null = null;
    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.loadData();
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event = null;
    }
    loadData() {
        var isLoading = !this.state.isRefresh;
        (isLoading)&&this.setState({ datas: [] });
        this.setState({ isLoading, isError: false }, ()=>
            Records.getAll()
                .then((value)=>this.setState({ datas: value, actualDatas: value, isLoading: false, isRefresh: false }))
                .catch(({ cause })=>this.setState({ isError: true, isLoading: false, messageError: cause  }))
        );
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    _keyExtractor({ id }: RecordData) {
        return `page5-item${id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<RecordData>) {
        return(<RecordItem
            title={item.type}
            description={item.movent}
            importance={parseInt(item.importance)}
            onPress={()=>this.setState({ viewDetails: true, viewDetailsData: item })}
        />);
    }
    _filterAsc() {
        if (this.state.filterActive == 'upward') return this.setState({ menuVisible: false }, ()=>ToastAndroid.show("El filtro seleccionado ya está activo.", ToastAndroid.SHORT));
        var data: RecordData[] = this.state.datas;
        this.setState({ isRefresh: true, menuVisible: false, actualDatas: data }, ()=>{
            var high = data.filter((value)=>parseInt(value.importance) == 1);
            var medium = data.filter((value)=>parseInt(value.importance) == 2);
            var normal = data.filter((value)=>parseInt(value.importance) == 3);
            var low = data.filter((value)=>parseInt(value.importance) == 4);
            var all = high.concat(medium, normal, low);
            this.setState({ isRefresh: false, datas: all, filterActive: 'upward' });
        });
    }
    _filterDesc() {
        if (this.state.filterActive == 'falling') return this.setState({ menuVisible: false }, ()=>ToastAndroid.show("El filtro seleccionado ya está activo.", ToastAndroid.SHORT));
        var data: RecordData[] = this.state.datas;
        this.setState({ isRefresh: true, menuVisible: false }, ()=>{
            var high = data.filter((value)=>parseInt(value.importance) == 1);
            var medium = data.filter((value)=>parseInt(value.importance) == 2);
            var normal = data.filter((value)=>parseInt(value.importance) == 3);
            var low = data.filter((value)=>parseInt(value.importance) == 4);
            var all = low.concat(normal, medium, high);
            this.setState({ isRefresh: false, datas: all, filterActive: 'falling' });
        });
    }
    _filterNormal() {
        if (this.state.filterActive == 'normal') return this.setState({ menuVisible: false }, ()=>ToastAndroid.show("No hay filtros establecidos.", ToastAndroid.SHORT));
        this.setState({ menuVisible: false, datas: this.state.actualDatas, filterActive: 'normal' });
    }
    _closeMenu() {
        this.setState({ menuVisible: false });
    }
    _getItemLayout(data: RecordData[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * data!.length,
            index
        };
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar>
                    <Appbar.Action icon={"menu"} onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Registros de actividad'} />
                    <Menu
                        visible={this.state.menuVisible}
                        onDismiss={this._closeMenu}
                        anchor={<Appbar.Action icon={'filter-variant'} color={'#FFFFFF'} onPress={()=>this.setState({ menuVisible: true })} disabled={(this.state.isLoading || this.state.isRefresh)} />}>
                        <Menu.Item title={"Ascendente"} icon={'sort-numeric-ascending'} onPress={this._filterAsc} />
                        <Divider />
                        <Menu.Item title={"Descendente"} icon={'sort-numeric-descending'} onPress={this._filterDesc} />
                        <Divider />
                        <Menu.Item title={"Limpiar filtros"} icon={'filter-off-outline'} onPress={this._filterNormal} />
                        <Divider />
                        <Menu.Item title={'Cancelar'} icon={'close'} onPress={this._closeMenu} />
                    </Menu>
                </Appbar>
                <View style={{ flex: 2, overflow: 'hidden' }}>
                    {(!this.state.isLoading && !this.state.isError)? <FlatList
                        data={this.state.datas}
                        extraData={this.state}
                        contentContainerStyle={{ paddingTop: 8 }}
                        refreshControl={<RefreshControl refreshing={this.state.isRefresh} colors={[Theme.colors.primary]} onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)} />}
                        getItemLayout={this._getItemLayout}
                        ItemSeparatorComponent={this._ItemSeparatorComponent}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />:
                    <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                        {(!this.state.isError)? <ActivityIndicator size={'large'} animating />:
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} />
                                <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                                <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={()=>this.setState({ isRefresh: true, isError: false }, this.loadData)} style={{ marginTop: 12 }} />
                            </View>
                        </View>}
                    </View>}
                    <ViewDetailsRecord
                        visible={this.state.viewDetails}
                        close={()=>this.setState({ viewDetails: false, viewDetailsData: undefined })}
                        datas={this.state.viewDetailsData}
                    />
                </View>
            </PaperProvider>
        </View>);
    }
}

type IProps2 = {
    title: string;
    description: string;
    importance: number;
    onPress?: ()=>any;
};
type IState2 = {
    icon: string;
    color: string;
};
class RecordItem extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            icon: 'close',
            color: 'red'
        };
    }
    componentDidMount() {
        this.setState({
            icon: (this.props.importance == 1)? 'alert-outline': (this.props.importance == 2)? 'alert-octagon-outline': (this.props.importance == 3)? 'alert-decagram-outline': 'alert-circle-outline',
            color: (this.props.importance == 1)? Colors.red500: (this.props.importance == 2)? Colors.yellow500: (this.props.importance == 3)? Colors.blue500: Colors.green500
        });
    }
    render(): React.ReactNode {
        return(<List.Item
            title={useUtf8(decode(this.props.title))}
            description={useUtf8(decode(this.props.description))}
            style={{ height: 72 }}
            onLayout={({ nativeEvent: { layout: { height } } })=>console.log(height)}
            left={(props)=><List.Icon
                {...props}
                icon={this.state.icon}
                color={this.state.color}
            />}
            onPress={(this.props.onPress)&&this.props.onPress}
        />);
    }
}