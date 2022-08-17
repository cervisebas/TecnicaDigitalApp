import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, ToastAndroid, View } from "react-native";
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
    filterActive: 'upward' | 'falling' | 'normal';
};
type leftProps = {
    color: string;
    style: {
        marginLeft: number;
        marginRight: number;
        marginVertical?: number | undefined;
    };
};

export default class Page5 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            datas: [],
            actualDatas: [],
            isLoading: true,
            isError: false,
            isRefresh: false,
            messageError: '',
            filterActive: 'normal'
        };
        this.loadData = this.loadData.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._filterAsc = this._filterAsc.bind(this);
        this._filterDesc = this._filterDesc.bind(this);
        this._filterNormal = this._filterNormal.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private refViewDetailsRecords = createRef<ViewDetailsRecord>();
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
    _filterAsc() {
        if (this.state.filterActive == 'upward') return ToastAndroid.show("El filtro seleccionado ya está activo.", ToastAndroid.SHORT);
        var data: RecordData[] = this.state.datas;
        this.setState({ isRefresh: true, actualDatas: data }, ()=>{
            var high = data.filter((value)=>parseInt(value.importance) == 1);
            var medium = data.filter((value)=>parseInt(value.importance) == 2);
            var normal = data.filter((value)=>parseInt(value.importance) == 3);
            var low = data.filter((value)=>parseInt(value.importance) == 4);
            var all = high.concat(medium, normal, low);
            this.setState({ isRefresh: false, datas: all, filterActive: 'upward' });
        });
    }
    _filterDesc() {
        if (this.state.filterActive == 'falling') return ToastAndroid.show("El filtro seleccionado ya está activo.", ToastAndroid.SHORT);
        var data: RecordData[] = this.state.datas;
        this.setState({ isRefresh: true }, ()=>{
            var high = data.filter((value)=>parseInt(value.importance) == 1);
            var medium = data.filter((value)=>parseInt(value.importance) == 2);
            var normal = data.filter((value)=>parseInt(value.importance) == 3);
            var low = data.filter((value)=>parseInt(value.importance) == 4);
            var all = low.concat(normal, medium, high);
            this.setState({ isRefresh: false, datas: all, filterActive: 'falling' });
        });
    }
    _filterNormal() {
        if (this.state.filterActive == 'normal') return ToastAndroid.show("No hay filtros establecidos.", ToastAndroid.SHORT);
        this.setState({ datas: this.state.actualDatas, filterActive: 'normal' });
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
            onPress={()=>this.refViewDetailsRecords.current?.open(item)}
        />);
    }
    _getItemLayout(_data: RecordData[] | null | undefined, index: number) {
        return {
            length: 72,
            offset: 72 * index,
            index
        };
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar>
                    <Appbar.Action icon={"menu"} onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Registros de actividad'} />
                    <CustomMenu
                        disable={this.state.isLoading || this.state.isError}
                        filterAsc={this._filterAsc}
                        filterDesc={this._filterDesc}
                        filterNormal={this._filterNormal}
                    />
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
                                <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={()=>this.setState({ isLoading: true, isError: false }, this.loadData)} style={{ marginTop: 12 }} />
                            </View>
                        </View>}
                    </View>}
                </View>
                <ViewDetailsRecord ref={this.refViewDetailsRecords}/>
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
    title: string;
    description: string;
};
class RecordItem extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            icon: 'close',
            color: 'red',
            title: '',
            description: ''
        };
        this.leftIcon = this.leftIcon.bind(this);
    }
    componentDidMount() {
        this.setState({
            icon: (this.props.importance == 1)? 'alert-outline': (this.props.importance == 2)? 'alert-octagon-outline': (this.props.importance == 3)? 'alert-decagram-outline': 'alert-circle-outline',
            color: (this.props.importance == 1)? Colors.red500: (this.props.importance == 2)? Colors.yellow500: (this.props.importance == 3)? Colors.blue500: Colors.green500,
            title: useUtf8(decode(this.props.title)),
            description: useUtf8(decode(this.props.description))
        });
    }
    leftIcon(props: leftProps) {
        return(<List.Icon
            {...props}
            icon={this.state.icon}
            color={this.state.color}
        />);
    }
    render(): React.ReactNode {
        return(<List.Item
            title={this.state.title}
            description={this.state.description}
            style={styles.item}
            left={this.leftIcon}
            onPress={(this.props.onPress)&&this.props.onPress}
        />);
    }
}

type IProps3 = {
    disable: boolean;
    filterAsc: ()=>any;
    filterDesc: ()=>any;
    filterNormal: ()=>any;
};
type IState3 = {
    isOpen: boolean;
};
class CustomMenu extends PureComponent<IProps3, IState3> {
    constructor(props: IProps3) {
        super(props);
        this.state = {
            isOpen: false
        };
        this._close = this._close.bind(this);
        this._open = this._open.bind(this);
        this._filterAsc = this._filterAsc.bind(this);
        this._filterDesc = this._filterDesc.bind(this);
        this._filterNormal = this._filterNormal.bind(this);
    }
    _close() {
        this.setState({ isOpen: false });
    }
    _open() {
        this.setState({ isOpen: true });
    }
    _filterAsc() {
        this.setState({ isOpen: false }, this.props.filterAsc);
    }
    _filterDesc() {
        this.setState({ isOpen: false }, this.props.filterDesc);
    }
    _filterNormal() {
        this.setState({ isOpen: false }, this.props.filterNormal);
    }
    render(): React.ReactNode {
        return(<Menu
            visible={this.state.isOpen}
            onDismiss={this._close}
            anchor={<Appbar.Action icon={'filter-variant'} color={'#FFFFFF'} onPress={this._open} disabled={this.props.disable} />}>
            <Menu.Item title={"Ascendente"} icon={'sort-numeric-ascending'} onPress={this._filterAsc} />
            <Divider />
            <Menu.Item title={"Descendente"} icon={'sort-numeric-descending'} onPress={this._filterDesc} />
            <Divider />
            <Menu.Item title={"Limpiar filtros"} icon={'filter-off-outline'} onPress={this._filterNormal} />
            <Divider />
            <Menu.Item title={'Cancelar'} icon={'close'} onPress={this._close} />
        </Menu>);
    }
}

const styles = StyleSheet.create({
    item: {
        height: 72
    }
});