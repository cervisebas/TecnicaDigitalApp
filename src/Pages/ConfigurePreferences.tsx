import React, { PureComponent } from "react";
import { DeviceEventEmitter, Dimensions, FlatList, ListRenderItemInfo, StyleSheet, ToastAndroid, View } from "react-native";
import { Appbar, Banner, Checkbox, Divider, FAB, List } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomModal from "../Components/CustomModal";
import { Prefences } from "../Scripts/ApiTecnica";
import Theme from "../Themes";

type Curses = {
    id: number;
    label: string;
    check: "checked" | "unchecked";
};

type IProps = {};
type IState = {
    visible: boolean;
    isLoading: boolean;
    curses: Curses[];
};

const { width } = Dimensions.get("window");

export default class ConfigurePreferences extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            isLoading: false,
            curses: this.default
        };
        this.clear = this.clear.bind(this);
        this.save = this.save.bind(this);
        this.finishLoad = this.finishLoad.bind(this);
        this.loadData = this.loadData.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this.close = this.close.bind(this);
    }
    private default: Curses[] = [
        { id: 11, label: '1°1', check: 'unchecked' },
        { id: 12, label: '1°2', check: 'unchecked' },
        { id: 13, label: '1°3', check: 'unchecked' },
        { id: 21, label: '2°1', check: 'unchecked' },
        { id: 22, label: '2°2', check: 'unchecked' },
        { id: 23, label: '2°3', check: 'unchecked' },
        { id: 31, label: '3°1', check: 'unchecked' },
        { id: 32, label: '3°2', check: 'unchecked' },
        { id: 33, label: '3°3', check: 'unchecked' },
        { id: 41, label: '4°1', check: 'unchecked' },
        { id: 42, label: '4°2', check: 'unchecked' },
        { id: 43, label: '4°3', check: 'unchecked' },
        { id: 51, label: '5°1', check: 'unchecked' },
        { id: 52, label: '5°2', check: 'unchecked' },
        { id: 53, label: '5°3', check: 'unchecked' },
        { id: 61, label: '6°1', check: 'unchecked' },
        { id: 62, label: '6°2', check: 'unchecked' },
        { id: 63, label: '6°3', check: 'unchecked' },
        { id: 71, label: '7°1', check: 'unchecked' },
        { id: 72, label: '7°2', check: 'unchecked' },
        { id: 73, label: '7°3', check: 'unchecked' }
    ];
    clear() {
        var clear = this.state.curses.map((v)=>{
            v.check = 'unchecked';
            return v;
        });
        this.setState({ curses: clear }, this.forceUpdate);
    }
    save() {
        this.setState({ isLoading: true }, async()=>{
            var newSaves: string[] = [];
            this.state.curses.forEach((v)=>(v.check == 'checked')&&(newSaves.push(v.label)));
            try {
                await Prefences.setAssist(newSaves);                
            } catch (err) {
                return ToastAndroid.show(err as any, ToastAndroid.SHORT);
            }
            setTimeout(this.finishLoad, 1500);
        });
    }
    finishLoad() {
        this.setState({ isLoading: false }, ()=>{
            ToastAndroid.show('Preferencias guardadas correctamente.', ToastAndroid.SHORT);
            DeviceEventEmitter.emit('p1-reload', undefined, false);
        });
    }
    set(id: number) {
        var findIndex = this.state.curses.findIndex((v)=>v.id == id);
        var datas = this.state.curses;
        datas[findIndex].check = (datas[findIndex].check == 'checked')? 'unchecked': 'checked';
        this.setState({ curses: datas }, this.forceUpdate);
    }

    async loadData() {
        var data = await Prefences.getAssist();
        var curses = this.state.curses.map((v)=>{
            if (data.find((v2)=>v2 == v.label)) v.check = 'checked';
            return v;
        });
        this.setState({ curses });
    }

    // Flatlist
    _keyExtractor(item: Curses) {
        return `pref-assist-${item.label}`;
    }
    _ItemSeparatorComponent() {
        return <Divider />;
    }
    _renderItem({ item }: ListRenderItemInfo<Curses>) {
        return(<List.Item
            title={`Curso ${item.label}`}
            style={styles.item}
            disabled={this.state.isLoading}
            onPress={()=>this.set(item.id)}
            right={(props)=><Checkbox
                {...props}
                status={item.check}
                onPress={()=>this.set(item.id)}
            />}
        />);
    }
    _getItemLayout(_data: Curses[] | null | undefined, index: number) {
        return {
            length: 52,
            offset: 52 * index,
            index
        }
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    
    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onShow={this.loadData} onRequestClose={this.close}>
            <View style={styles.content}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={'Preferencias de registros'} />
                    <Appbar.Action icon={'autorenew'} onPress={this.clear} />
                </Appbar.Header>
                <FlatList
                    data={this.state.curses}
                    extraData={this.state}
                    keyExtractor={this._keyExtractor}
                    contentContainerStyle={{ paddingBottom: 76 }}
                    ItemSeparatorComponent={this._ItemSeparatorComponent}
                    getItemLayout={this._getItemLayout}
                    renderItem={this._renderItem}
                />
                <FAB
                    icon={'send'}
                    label={(this.state.isLoading)? 'GUARDANDO': 'GUARDAR'}
                    onPress={(!this.state.isLoading)? this.save: undefined}
                    loading={this.state.isLoading}
                    style={styles.fab}
                />
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        width: (width - 16),
        marginLeft: 8,
        marginRight: 8,
        height: '90%',
        backgroundColor: Theme.colors.background,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative'
    },
    item: {
        height: 52
    },
    fab: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        marginBottom: 16,
        marginLeft: 96,
        marginRight: 96
    }
});