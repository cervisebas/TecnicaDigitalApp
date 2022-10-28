import React, { createRef, PureComponent } from "react";
import { ListRenderItemInfo, NativeSyntheticEvent, Platform, StyleSheet, TextInputSubmitEditingEventData, View } from "react-native";
import CustomModal from "../../Components/CustomModal";
import { ThemeContext } from "../../Components/ThemeProvider";
import { Appbar, Avatar, Divider, List, overlay, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FlatList } from "react-native-gesture-handler";
import { CustomSearchbar } from "../../Pages/SearchStudents";
import { capitalizeArrayString, orderArraySingle } from "../../Scripts/Utils";
import MatterList from "./MatterList.json";

type IProps = {
    onSelect?: (value: string)=>any;
};
type IState = {
    visible: boolean;

    listMatter: string[];
    listShow: string[];
};

export default class SelectorMatter extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            listMatter: [],
            listShow: []
        };
        this.goSearch = this.goSearch.bind(this);
        this._onEmpty = this._onEmpty.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this.close = this.close.bind(this);
    }
    static contextType = ThemeContext;

    goSearch({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        this.setState({
            listShow: orderArraySingle(this.state.listMatter, text, false)
        });
    }
    _onEmpty() {
        this.setState({
            listShow: this.state.listMatter
        });
    }

    select(value: string) {
        if (!this.props.onSelect) return;
        this.props.onSelect(value);
        this.close();
    }

    componentDidMount(): void {
        const list = capitalizeArrayString(MatterList as string[]);
        this.setState({
            listMatter: list,
            listShow: list
        });
    }

    // FlatList
    _keyExtractor(_item: string, index: number) {
        return `item-selector-matter-${index}`;
    }
    _renderItem({ item, index }: ListRenderItemInfo<string>) {
        return(<List.Item
            key={`item-selector-matter-${index}`}
            style={styles.item}
            title={item}
            onPress={()=>this.select(item)}
            left={(props)=><Avatar.Icon
                {...props}
                size={36}
                color={'#FFFFFF'}
                icon={'google-classroom'}
            />}
        />);
    }
    _getItemLayout(_data: string[] | null | undefined, index: number) {
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
    open() {
        this.setState({
            visible: true
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
                        <Appbar.Content title={'Seleccionar materia'} />
                    </Appbar.Header>
                    <View style={{ flex: 3 }}>
                        <View style={[styles.viewSearchbar, { backgroundColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary, borderBottomColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary }]}>
                            <CustomSearchbar
                                visible={this.state.visible}
                                disableTextExamples={true}
                                disableAutoFocus={true}
                                onEmpty={this._onEmpty}
                                onSubmit={this.goSearch}
                            />
                        </View>
                        <FlatList
                            data={this.state.listShow}
                            extraData={this.state}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            contentContainerStyle={{ flex: (this.state.listShow.length == 0)? 2: undefined, paddingBottom: 12 }}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            ListEmptyComponent={()=><View style={styles.emptyContent}><Icon name={'playlist-remove'} color={theme.colors.text} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ninguna materia</Text></View>}
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
    emptyContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    viewSearchbar: {
        marginTop: -8,
        borderBottomWidth: 1
    }
});