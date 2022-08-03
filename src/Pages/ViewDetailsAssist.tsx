import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from "@react-navigation/material-top-tabs";
import { decode } from "base-64";
import moment from "moment";
import React, { Component } from "react";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import { ActivityIndicator, Appbar, Colors, Divider, List, Text } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { AssistIndividualData } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";

type DataAssist = {
    label: string;
    key: string;
    dateInt: number;
    data: AssistIndividualData[];
};

type IProps = {
    visible: boolean;
    close: ()=>any;
    datas: AssistIndividualData[];
};
type IState = {
    isLoading: boolean;
    datas: DataAssist[];
};

const Tab = createMaterialTopTabNavigator();

export default class ViewDetailsAssist extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            datas: []
        };
        moment.locale('es');
        this.loadData = this.loadData.bind(this);
    }
    loadData() {
        this.setState({ isLoading: true }, ()=>{
            var newData: DataAssist[] = [];
            this.props.datas.forEach((value)=>{
                var tDate = moment(decode(value.date), 'DD/MM/YYYY').format('MMMM (YYYY)');
                var findIndex = newData.findIndex((v)=>v.label == tDate);
                if (findIndex !== -1) {
                    newData[findIndex].data.push(value);
                    return;
                }
                var dateInt = moment(decode(value.date), 'DD/MM/YYYY').toDate().getTime();
                newData.push({
                    label: tDate,
                    key: tDate.replace(/\ /gi, '-').toLowerCase(),
                    dateInt,
                    data: [value]
                });
            });
            newData.sort((a, b)=>b.dateInt - a.dateInt);
            this.setState({ datas: newData, isLoading: false });
        });
    }
    private tabOptions: MaterialTopTabNavigationOptions = {
        tabBarScrollEnabled: true,
        tabBarLabelStyle: { color: '#FFFFFF' },
        tabBarStyle: { backgroundColor: Theme.colors.primary },
        tabBarIndicatorStyle: { backgroundColor: Theme.colors.accent, height: 4 }
    };
    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onShow={this.loadData} onRequestClose={this.props.close}>
            <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.props.close} />
                    <Appbar.Content title={'Ver más detalles'}  />
                </Appbar.Header>
                <View style={{ flex: 2 }}>
                    {(!this.state.isLoading)? <Tab.Navigator screenOptions={this.tabOptions}>
                        {this.state.datas.map((value)=><Tab.Screen
                            key={value.key}
                            name={value.label}
                            children={()=><ViewAssistPanel datas={value.data} />}
                        />)}
                    </Tab.Navigator>: <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size={'large'} animating />
                    </View>}
                </View>
            </View>
        </CustomModal>);
    }
}

type IProps2 = {
    datas: AssistIndividualData[];
};
class ViewAssistPanel extends Component<IProps2> {
    constructor(props: IProps2) {
        super(props);
        this._renderItem = this._renderItem.bind(this);
    }
    _renderItem({ item }: ListRenderItemInfo<AssistIndividualData>) {
        return(<List.Item
            key={`detail-assist-${item.id}`}
            title={`${decode(item.date)}`}
            description={`${(item.status)? 'Presente': 'Ausente'} ${(item.credential)? ' (Accedió con credencial)': ''}`}
            right={()=><View style={{ height: '100%', justifyContent: 'center', paddingRight: 8 }}>
                <Text>{decode(item.hour)}</Text>
            </View>}
            left={()=><List.Icon
                icon={(item.status)? 'radiobox-marked': 'radiobox-blank'}
                color={(item.status)? Colors.blue500: Colors.red500}
            />}
            style={{ height: 70 }}
        />);
    }
    _keyExtractor({ id }: AssistIndividualData) {
        return `detail-assist-${id}`;
    }
    _getItemLayout(_data: AssistIndividualData[] | null | undefined, index: number) {
        return {
            length: 70,
            offset: 70 * index,
            index
        };
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 3 }}>
            <FlatList
                data={this.props.datas}
                ItemSeparatorComponent={this._ItemSeparatorComponent}
                keyExtractor={this._keyExtractor}
                getItemLayout={this._getItemLayout}
                renderItem={this._renderItem}
            />
        </View>);
    }
}