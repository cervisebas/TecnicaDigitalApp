import React, { createRef, PureComponent } from "react";
import { ListRenderItemInfo, NativeSyntheticEvent, Platform, StyleSheet, TextInputSubmitEditingEventData, View } from "react-native";
import CustomModal from "../../Components/CustomModal";
import { ThemeContext } from "../../Components/ThemeProvider";
import { Appbar, Avatar, Divider, List, overlay, Provider as PaperProvider } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";
import { decode, encode } from "base-64";
import { CustomSearchbar } from "../../Pages/SearchStudents";
import { orderArray, removeItem } from "../../Scripts/Utils";
import { ThemeLight } from "../../Themes";

type IProps = {
    onSelect?: (value: string)=>any;
};
type IState = {
    visible: boolean;

    idSelect: string;
    listTeachers: {
        id: string;
        name: string;
    }[];
    listShow: {
        id: string;
        name: string;
    }[];
};

export default class SelectorTeacher extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            idSelect: '-1',
            listTeachers: [],
            listShow: []
        };
        this.goSearch = this.goSearch.bind(this);
        this._onEmpty = this._onEmpty.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this.close = this.close.bind(this);
    }
    static contextType = ThemeContext;
    // Ref's
    private refSearchBar = createRef<CustomSearchbar>();

    goSearch({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        const processList = removeItem(this.state.listTeachers, 0);
        this.setState({ listShow: orderArray(processList, 'name', text) });
    }
    _onEmpty() {
        const listShow = (this.state.listTeachers.findIndex((v)=>v.id == '-1') == -1)? [{ id: '-1', name: encode('- Seleccionar -') }].concat(this.state.listTeachers): this.state.listTeachers;
        this.setState({ listShow });
    }

    select(value: string) {
        if (!this.props.onSelect) return;
        this.props.onSelect(value);
        this.close();
    }

    // FlatList
    _keyExtractor(item: { id: string; name: string; }, _index: number) {
        return `item-selector-teacher-${item.id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<{ id: string; name: string; }>) {
        return(<List.Item
            style={styles.item}
            title={decode(item.name)}
            onPress={()=>this.select(item.id)}
            left={(props)=><Avatar.Icon
                {...props}
                size={36}
                color={'#FFFFFF'}
                style={(item.id == '-1')? { backgroundColor: ThemeLight.colors.accent }: undefined}
                icon={(item.id == '-1')? 'account-off': 'account'}
            />}
        />);
    }
    _getItemLayout(_data: { id: string; name: string; }[] | null | undefined, index: number) {
        return {
            length: 50,
            offset: 50 * index,
            index
        };
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }

    // Controller
    open(idSelect: string, listTeachers: { id: string; name: string; }[]) {
        const listShow = (listTeachers.findIndex((v)=>v.id == '-1') == -1)? [{ id: '-1', name: encode('- Seleccionar -') }].concat(listTeachers): listTeachers;
        this.setState({
            visible: true,
            idSelect,
            listTeachers,
            listShow
        });
    }
    close() {
        this.setState({
            visible: false
        });
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close} style={{ padding: 16 }} animationIn={'zoomIn'} animationOut={'zoomOut'}>
            <PaperProvider theme={theme}>
                <View style={{ flex: 2, backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background, borderRadius: 12, overflow: 'hidden' }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} borderless={Platform.Version > 25} />
                        <Appbar.Content title={'Seleccionar docente'} />
                    </Appbar.Header>
                    <View style={{ flex: 3 }}>
                        <View style={[styles.viewSearchbar, { backgroundColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary, borderBottomColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary }]}>
                            <CustomSearchbar
                                ref={this.refSearchBar}
                                visible={this.state.visible}
                                disableTextExamples={true}
                                onEmpty={this._onEmpty}
                                onSubmit={this.goSearch}
                            />
                        </View>
                        <FlatList
                            data={this.state.listShow}
                            extraData={this.state}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            contentContainerStyle={{ paddingBottom: 12 }}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            renderItem={this._renderItem}
                        />
                    </View>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    item: {
        height: 50
    },
    viewSearchbar: {
        marginTop: -8,
        borderBottomWidth: 1
    }
});