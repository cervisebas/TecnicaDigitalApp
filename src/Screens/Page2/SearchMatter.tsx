import React, { createRef, PureComponent } from "react";
import { ListRenderItemInfo, NativeSyntheticEvent, Platform, StyleSheet, TextInputSubmitEditingEventData, View } from "react-native";
import CustomModal from "../../Components/CustomModal";
import { ThemeContext } from "../../Components/ThemeProvider";
import { Appbar, Divider, IconButton, List, overlay, ProgressBar, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FlatList } from "react-native-gesture-handler";
import { CustomSearchbar } from "../../Pages/SearchStudents";
import { orderArray, orderArrayAlphabeticallyTwo, orderArrayBySelect, waitTo } from "../../Scripts/Utils";
import { Matter } from "../../Scripts/ApiTecnica/types";
import { decode } from "base-64";
import { DialogDeleteMatter } from "./DialogDeleteMatter";

type IProps = {
    matters: Matter[];
    isLoading: boolean;
    onEdit: (item: Matter)=>any;
    setDelete: (id: string)=>any;
    goDelete: ()=>any;
};
type IState = {
    visible: boolean;
    activeFilter: boolean;
    listShow: Matter[];
};

export default class SearchMatter extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            activeFilter: false,
            listShow: []
        };
        this.goSearch = this.goSearch.bind(this);
        this._onEmpty = this._onEmpty.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this.controlFilter = this.controlFilter.bind(this);
        this.close = this.close.bind(this);
        this.update = this.update.bind(this);
    }
    static contextType = ThemeContext;
    private isFilter: boolean = false;
    private search: string = '';
    // Ref's
    private refSearchBar = createRef<CustomSearchbar>();
    private refDialogDelete = createRef<DialogDeleteMatter>();
    private refCustomProgressbar = createRef<CustomProgressbar>();

    async goSearch({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        this.refCustomProgressbar.current?.show(true);
        this.search = text;
        await waitTo(380);
        orderArrayBySelect(this.setFilter(this.props.matters), ['name', 'teacher.name'], text)
            .then((listShow)=>{
                this.setState({ listShow });
                this.refCustomProgressbar.current?.show(false);
            });
    }
    setFilter(list: Matter[]) {
        if (this.isFilter) return orderArrayAlphabeticallyTwo(list, 'teacher', 'name');
        return list;
    }
    _onEmpty() {
        this.search = '';
        this.setState({
            listShow: this.setFilter(this.props.matters)
        });
    }

    onDelete(id: string) {
        this.props.setDelete(id);
        this.refDialogDelete.current?.open();
    }

    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
        if (this.props.isLoading !== prevProps.isLoading) {
            if (this.props.isLoading && !this.refCustomProgressbar.current?.isLoading())
                this.refCustomProgressbar.current?.show(true);
            else if (this.refCustomProgressbar.current?.isLoading())
                this.refCustomProgressbar.current.show(false);
        }
    }

    // FlatList
    _keyExtractor(item: Matter, _index: number) {
        return `matter-item-${item.id}-teacher-${item.teacher.id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<Matter>) {
        return(<List.Item
            key={`matter-item-${item.id}-teacher-${item.teacher.id}`}
            title={decode(item.name)}
            titleNumberOfLines={2}
            description={(item.teacher.id == '-1')? "Sin profesor": decode(item.teacher.name)}
            style={styles.item}
            descriptionStyle={styles.itemDescription}
            left={(props)=><List.Icon {...props} icon={'folder-account-outline'} />}
            right={(props)=><>
                <IconButton
                    {...props}
                    icon={'pencil-outline'}
                    onPress={()=>this.props.onEdit(item)}
                />
                <IconButton
                    {...props}
                    icon={'delete-outline'}
                    onPress={()=>this.onDelete(item.id)}
                />
            </>}
        />);
    }
    _getItemLayout(_data: Matter[] | null | undefined, index: number) {
        return {
            length: 68,
            offset: 68 * index,
            index
        };
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    async controlFilter() {
        if (this.refCustomProgressbar.current?.isLoading()) return;
        this.refCustomProgressbar.current?.show(true);
        if (this.isFilter) this.isFilter = false; else {
            this.isFilter = true;
            await waitTo(512);
        }
        this.setState({ activeFilter: this.isFilter }, this.update);
        this.refCustomProgressbar.current?.show(false);
    }

    // Controller
    open() {
        this.setState({
            visible: true,
            listShow: this.setFilter(this.props.matters)
        });
    }
    close() {
        if (this.refDialogDelete.current?.state.visible) return this.refDialogDelete.current.close();
        this.isFilter = false;
        this.search = '';
        this.setState({
            visible: false,
            activeFilter: false
        });
    }
    update() {
        if (this.search !== '') return this.setState({ listShow: orderArray(this.setFilter(this.props.matters), 'name', this.search) });
        this.setState({ listShow: this.setFilter(this.props.matters) });
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <PaperProvider theme={theme}>
                <View style={{ flex: 2, backgroundColor: theme.colors.background }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} borderless={Platform.Version > 25} />
                        <Appbar.Content title={'Buscar materia'} />
                        <Appbar.Action
                            icon={(this.state.activeFilter)? 'filter-outline': 'filter-off-outline'}
                            onPress={this.controlFilter}
                        />
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
                        {/*<ProgressBar
                            indeterminate={true}
                            style={{ opacity: (this.props.isLoading || this.state.loadingFilter)? 1: 0 }}
                            color={(!isDark)? theme.colors.accent: undefined}
                        />*/}
                        <CustomProgressbar ref={this.refCustomProgressbar} />
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
                <DialogDeleteMatter ref={this.refDialogDelete} onConfirm={this.props.goDelete} />
            </PaperProvider>
        </CustomModal>);
    }
}

type IProps2 = {};
type IState2 = {
    isLoading: boolean;
};
class CustomProgressbar extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            isLoading: false
        };
    }
    static contextType = ThemeContext;
    show(isLoading: boolean) {
        this.setState({ isLoading });
    }
    isLoading() {
        return this.state.isLoading;
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<ProgressBar
            indeterminate={true}
            style={{ opacity: (this.state.isLoading)? 1: 0 }}
            color={(!isDark)? theme.colors.accent: undefined}
        />);
    }
}

const styles = StyleSheet.create({
    item: {
        height: 68
    },
    viewSearchbar: {
        marginTop: -8,
        borderBottomWidth: 1
    },
    emptyContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    itemDescription: {
        marginLeft: 4
    }
});