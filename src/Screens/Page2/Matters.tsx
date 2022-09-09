import { decode } from "base-64";
import React, { PureComponent } from "react";
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Divider, IconButton, List, Text } from "react-native-paper";
import { Matter } from "../../Scripts/ApiTecnica/types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Theme from "../../Themes";
import { Matters } from "../../Scripts/ApiTecnica";

type IProps = {
    handlerLoad: (status: boolean)=>any;
};
type IState = {
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;
    datas: Matter[];
};

export default class Page2Matters extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            isRefresh: false,
            isError: false,
            messageError: '',
            datas: []
        };
        this._refreshNow = this._refreshNow.bind(this);
        this._renderItem = this._renderItem.bind(this);
    }
    componentDidMount(): void {
        this.loadData();
    }
    loadData() {
        this.props.handlerLoad(false);
        if (!this.state.isRefresh) this.setState({ isLoading: true, datas: [] });
        this.setState({ isError: false }, ()=>
            Matters.getAll()
                .then((datas)=>{
                    this.setState({ datas, isLoading: false, isRefresh: false });
                    this.props.handlerLoad(true);
                })
                .catch((error)=>this.setState({ isLoading: false, isError: true, messageError: error.cause }))
        );
    }

    _refreshNow() {
        this.setState({ isRefresh: true }, this.loadData);
    }
    /* ##### Flatlist ##### */
    _renderItem({ item }: ListRenderItemInfo<Matter>) {
        return(<List.Item
            key={`matter-item-${item.id}-teacher-${item.teacher.id}`}
            title={decode(item.name)}
            description={(item.teacher.id == '-1')? "Sin profesor": decode(item.teacher.name)}
            style={styles.item}
            left={(props)=><List.Icon {...props} icon={'folder-account-outline'} />}
        />);
    }
    _keyExtractor(item: Matter) {
        return `matter-item-${item.id}-teacher-${item.teacher.id}`;
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    _getItemLayout(_data: Matter[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * index,
            index
        };
    }
    /* #################### */

    render(): React.ReactNode {
        return(<View style={styles.content}>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                {(!this.state.isLoading)? (!this.state.isError)?
                <FlatList
                    data={this.state.datas}
                    extraData={this.state}
                    keyExtractor={this._keyExtractor}
                    getItemLayout={this._getItemLayout}
                    refreshControl={<RefreshControl colors={[Theme.colors.primary]} refreshing={this.state.isRefresh} onRefresh={this._refreshNow} />}
                    contentContainerStyle={{ flex: (this.state.datas.length == 0)? 2: undefined, paddingTop: 8 }}
                    ListEmptyComponent={()=><View style={styles.emptyContent}><Icon name={'playlist-remove'} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ninguna materia</Text></View>}
                    renderItem={this._renderItem}
                />:
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} />
                        <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                        <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={this.loadData} style={{ marginTop: 12 }} />
                    </View>
                </View>
                :<View style={styles.loadingContent}><ActivityIndicator size={'large'} animating /></View>}
            </View>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    emptyContent: {
        flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
    },
    loadingContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item: {
        height: 64
    }
});