import { decode } from "base-64";
import React, { Component } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import { Text, Appbar } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { DataGroup } from "../Scripts/ApiTecnica/types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Theme from "../Themes";
import CustomCard from "../Components/Elements/CustomCard";

type IProps = {
    openConfirm: (id: string, curse: string, date: string)=>any;
    openView: (id: string, curse: string, date: string, hour: string, annotations: number)=>any;
};
type IState = {
    visible: boolean;
    datas: DataGroup[];
    title: string;
};

export default class SearchGroupsResult extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            datas: [],
            title: '00/00/0000'
        };
        this._renderItem = this._renderItem.bind(this);
        this.updateDataLocal = this.updateDataLocal.bind(this);
        this.close = this.close.bind(this);
    }
    updateDataLocal() {
        if (this.state.datas.length == 0) return this.setState({ title: 'Sin resultados' });
        this.setState({ title: decode(this.state.datas[0].date) });
    }

    _keyExtractor({ id }: DataGroup) {
        return `p1-card-${id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<DataGroup>) {
        return(<CustomCard
            key={`p1-card-${item.id}`}
            title={`Registro ${decode(item.curse)}`}
            date={`${decode(item.date)} (${decode(item.hour)}hs)`}
            state={(item.status == '0')? false: true}
            openConfirm={()=>this.props.openConfirm(item.id, item.curse, item.date)}
            openView={()=>this.props.openView(item.id, item.curse, item.date, item.hour, item.annotations)}
        />);
    }
    _getItemLayout(_data: DataGroup[] | null | undefined, index: number) {
        return {
            length: 125,
            offset: 125 * index,
            index
        };
    }

    // Controller
    open(datas: DataGroup[]) {
        this.setState({
            visible: true,
            datas
        });
    }
    close() {
        this.setState({ visible: false, datas: [] });
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onShow={this.updateDataLocal} onRequestClose={this.close}>
            <View style={styles.content}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={`Busqueda: ${this.state.title}`}  />
                </Appbar.Header>
                <View style={{ flex: 2 }}>
                    <FlatList
                        data={this.state.datas}
                        keyExtractor={this._keyExtractor}
                        contentContainerStyle={{ flex: (this.state.datas.length == 0)? 2: undefined, paddingTop: 8 }}
                        ListEmptyComponent={()=><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún registro</Text></View>}
                        renderItem={this._renderItem}
                        getItemLayout={this._getItemLayout}
                    />
                </View>
            </View>
        </CustomModal>);
    }
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: Theme.colors.background
    }
});