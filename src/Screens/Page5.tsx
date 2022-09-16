import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Colors, Divider, IconButton, List, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Records } from "../Scripts/ApiTecnica";
import { RecordData } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import { decode } from "base-64";
import { decode as utf8decode } from "utf8";
import ViewDetailsRecord from "../Pages/ViewDetailsRecord";
import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from "@react-navigation/material-top-tabs";
import { NavigationContainer } from "@react-navigation/native";

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
    newDatas: DataFilters[];
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
type DataFilters = {
    title: string;
    data: RecordData[];
};

export default class Page5 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            newDatas: [],
            isLoading: true,
            isError: false,
            isRefresh: false,
            messageError: '',
            filterActive: 'normal'
        };
        this.loadData = this.loadData.bind(this);
        this._onRefresh = this._onRefresh.bind(this);
        this._openInfo = this._openInfo.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private refViewDetailsRecords = createRef<ViewDetailsRecord>();
    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.loadData();
    }
    componentWillUnmount() {
        this.event?.remove();
    }
    loadData() {
        var isLoading = !this.state.isRefresh || this.state.isError;
        (isLoading)&&this.setState({ newDatas: [] });
        this.setState({ isLoading, isError: false }, ()=>
            Records.getAll()
                .then((value)=>this.setState({
                    newDatas: this.filterByDay(value),
                    isLoading: false,
                    isRefresh: false
                }))
                .catch(({ cause })=>this.setState({ isError: true, isLoading: false, messageError: cause  }))
        );
    }
    filterByDay(datas: RecordData[]) {
        var recolect: DataFilters[] = [];
        datas.forEach((value)=>{
            const findIndex = recolect.findIndex((f)=>f.title == decode(value.date));
            if (findIndex !== -1) return recolect[findIndex].data.push(value);
            recolect.push({
                title: decode(value.date),
                data: [value]
            });
        });
        return recolect;
    }
    _onRefresh() {
        this.setState({ isRefresh: true }, this.loadData);
    }
    _openInfo(data: RecordData) {
        this.refViewDetailsRecords.current?.open(data);
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar>
                    <Appbar.Action icon={"menu"} onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Registros de actividad'} />
                </Appbar>
                <View style={{ flex: 2, overflow: 'hidden' }}>
                    {(!this.state.isLoading && !this.state.isError)?
                    <ViewRegistDay
                        data={this.state.newDatas}
                        isRefresh={this.state.isRefresh}
                        onRefresh={this._onRefresh}
                        openInfo={this._openInfo}
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

type IProps4 = {
    data: DataFilters[];
    isRefresh: boolean;
    onRefresh: ()=>any;
    openInfo: (data: RecordData)=>any;
};
type IState4 = {};

const Tab = createMaterialTopTabNavigator();

class ViewRegistDay extends PureComponent<IProps4, IState4> {
    constructor(props: IProps4) {
        super(props);
        this._renderItem = this._renderItem.bind(this);
    }
    private tabOptions: MaterialTopTabNavigationOptions = {
        lazy: true,
        lazyPreloadDistance: 1,
        swipeEnabled: true,
        tabBarScrollEnabled: true,
        tabBarStyle: { backgroundColor: Theme.colors.primary },
        tabBarIndicatorStyle: { backgroundColor: Theme.colors.accent, height: 4 }
    };
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
            onPress={()=>this.props.openInfo(item)}
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
        return(<NavigationContainer independent theme={{ ...Theme, colors: { ...Theme.colors, text: '#FFFFFF' } }}>
            <Tab.Navigator screenOptions={this.tabOptions}>
                {this.props.data.map((value)=><Tab.Screen
                    key={value.title}
                    name={`${value.title} (${value.data.length})`}
                    children={()=><FlatList
                        data={value.data}
                        extraData={value}
                        contentContainerStyle={styles.contentFlatlist}
                        refreshControl={<RefreshControl refreshing={this.props.isRefresh} colors={[Theme.colors.primary]} onRefresh={this.props.onRefresh} />}
                        getItemLayout={this._getItemLayout}
                        ItemSeparatorComponent={this._ItemSeparatorComponent}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />}
                />)}
            </Tab.Navigator>
        </NavigationContainer>);
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

const styles = StyleSheet.create({
    contentFlatlist: {
        paddingTop: 8
    },
    item: {
        height: 72
    }
});