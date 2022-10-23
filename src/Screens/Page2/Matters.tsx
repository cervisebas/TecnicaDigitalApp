import { decode } from "base-64";
import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Dialog, Divider, IconButton, List, Paragraph, Portal, Text } from "react-native-paper";
import { Matter } from "../../Scripts/ApiTecnica/types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Matters } from "../../Scripts/ApiTecnica";
import CustomSnackbar from "../../Components/Elements/CustomSnackbar";
import EditMatter from "./EditMatter";
import { ThemeContext } from "../../Components/ThemeProvider";
import SelectorTeacher from "./SelectorTeacher";
import SelectorMatter from "./SelectorMatter";
import SearchMatter from "./SearchMatter";
import { DialogDeleteMatter } from "./DialogDeleteMatter";

type IProps = {
    handlerLoad: (status: boolean)=>any;
    goLoading: (visible: boolean, message?: string)=>any;
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
        this.loadData = this.loadData.bind(this);
        this.goDelete = this.goDelete.bind(this);
        this._setDelete = this._setDelete.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this._refreshNow = this._refreshNow.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._goSnackbar = this._goSnackbar.bind(this);
        this._openTeacherSelector = this._openTeacherSelector.bind(this);
        this._openMatterSelector = this._openMatterSelector.bind(this);
        this._updateTeacherAddMatter = this._updateTeacherAddMatter.bind(this);
        this._updateMatterAddMatter = this._updateMatterAddMatter.bind(this);
    }
    private event: EmitterSubscription | undefined = undefined;
    private idDelete: string = '-1';
    static contextType = ThemeContext;
    // Ref's
    private refDialogDelete = createRef<DialogDeleteMatter>();
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refEditMatter = createRef<EditMatter>();
    private refSelectorTeacher = createRef<SelectorTeacher>();
    private refSelectorMatter = createRef<SelectorMatter>();
    public refSearchMatter = createRef<SearchMatter>();

    componentDidMount(): void {
        this.event = DeviceEventEmitter.addListener('p2-matters-reload', (isRefresh?: boolean | undefined)=>this.setState({ isRefresh: !!isRefresh }, this.loadData));
        this.loadData();
    }
    componentWillUnmount(): void {
        this.event?.remove();
    }
    loadData() {
        if (!this.state.isRefresh) {
            this.props.handlerLoad(false);
            this.setState({ isLoading: true, datas: [] });
        }
        this.setState({ isError: false }, ()=>
            Matters.getAll()
                .then((datas)=>{
                    this.setState({ datas, isLoading: false, isRefresh: false });
                    this.props.handlerLoad(true);
                    this.refSearchMatter.current?.update();
                })
                .catch((error)=>this.setState({ isLoading: false, isError: true, messageError: error.cause }))
        );
    }
    goDelete() {
        this.props.goLoading(true, 'Eliminando...');
        Matters.delete(this.idDelete)
            .then(()=>{
                this.refCustomSnackbar.current?.open('Materia borrada con éxito.');
                this.props.goLoading(false);
                this.setState({ isRefresh: true }, this.loadData);
            })
            .catch((error)=>{
                this.refCustomSnackbar.current?.open(error.cause);
                this.props.goLoading(false);
            })
    }
    _setDelete(id: string) {
        this.idDelete = id;
    }
    onDelete(id: string) {
        this.refDialogDelete.current?.open();
        this.idDelete = id;
    }
    onEdit(item: Matter) {
        this.refEditMatter.current?.open(item);
    }

    _refreshNow() {
        this.setState({ isRefresh: true }, this.loadData);
    }
    _goSnackbar(message: string) {
        this.refCustomSnackbar.current?.open(message);
    }
    /* ##### Flatlist ##### */
    _renderItem({ item }: ListRenderItemInfo<Matter>) {
        return(<List.Item
            key={`matter-item-${item.id}-teacher-${item.teacher.id}`}
            title={decode(item.name)}
            description={(item.teacher.id == '-1')? "Sin profesor": decode(item.teacher.name)}
            style={styles.item}
            descriptionStyle={styles.itemDescription}
            left={(props)=><List.Icon {...props} icon={'folder-account-outline'} />}
            right={(props)=><>
                <IconButton
                    {...props}
                    icon={'pencil-outline'}
                    onPress={()=>this.onEdit(item)}
                />
                <IconButton
                    {...props}
                    icon={'delete-outline'}
                    onPress={()=>this.onDelete(item.id)}
                />
            </>}
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

    // Edit Matter: Functions
    _openTeacherSelector(id: string, listTeachers: { id: string; name: string; }[]) {
        this.refSelectorTeacher.current?.open(id, listTeachers);
    }
    _openMatterSelector() {
        this.refSelectorMatter.current?.open();
    }
    _updateTeacherAddMatter(id: string) {
        this.refEditMatter.current?.updateTeacher(id);
    }
    _updateMatterAddMatter(matter: string) {
        this.refEditMatter.current?.updateMatter(matter);
    }

    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View style={styles.content}>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                {(!this.state.isLoading)? (!this.state.isError)?
                <FlatList
                    data={this.state.datas}
                    extraData={this.state}
                    keyExtractor={this._keyExtractor}
                    getItemLayout={this._getItemLayout}
                    refreshControl={<RefreshControl colors={[theme.colors.primary]} progressBackgroundColor={theme.colors.surface} refreshing={this.state.isRefresh} onRefresh={this._refreshNow} />}
                    contentContainerStyle={{ flex: (this.state.datas.length == 0)? 2: undefined, paddingTop: 8, paddingBottom: 124 }}
                    ItemSeparatorComponent={this._ItemSeparatorComponent}
                    ListEmptyComponent={()=><View style={styles.emptyContent}><Icon name={'playlist-remove'} color={theme.colors.text} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ninguna materia</Text></View>}
                    renderItem={this._renderItem}
                />:
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <Icon name={'account-alert-outline'} color={theme.colors.text} size={48} style={{ fontSize: 48 }} />
                        <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                        <IconButton icon={'reload'} color={theme.colors.primary} size={28} onPress={this.loadData} style={{ marginTop: 12 }} />
                    </View>
                </View>
                :<View style={styles.loadingContent}><ActivityIndicator size={'large'} animating /></View>}
            </View>
            <CustomSnackbar style={styles.snackbar} ref={this.refCustomSnackbar} />
            <DialogDeleteMatter ref={this.refDialogDelete} onConfirm={this.goDelete} />

            {/* Modal's */}
            <EditMatter
                ref={this.refEditMatter}
                snackbar={this._goSnackbar}
                openTeacherSelector={this._openTeacherSelector}
                openMatterSelector={this._openMatterSelector}
            />
            <SelectorTeacher ref={this.refSelectorTeacher} onSelect={this._updateTeacherAddMatter} />
            <SelectorMatter ref={this.refSelectorMatter} onSelect={this._updateMatterAddMatter} />

            <SearchMatter
                ref={this.refSearchMatter}
                matters={this.state.datas}
                isLoading={this.state.isLoading || this.state.isRefresh}
                onEdit={this.onEdit}
                setDelete={this._setDelete}
                goDelete={this.goDelete}
            />
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    emptyContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    loadingContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item: {
        height: 64
    },
    itemDescription: {
        marginLeft: 4
    },
    snackbar: {
        bottom: 76
    }
});