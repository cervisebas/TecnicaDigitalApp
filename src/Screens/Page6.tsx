import React, { Component, createRef, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, ListRenderItemInfo, RefreshControl, StyleSheet, ToastAndroid, View } from "react-native";
import { ActivityIndicator, Appbar, IconButton, Provider as PaperProvider, Snackbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Groups as GroupsTypes, OrderCurses, StudentsData } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import { Groups, Student } from "../Scripts/ApiTecnica";
import AddNewGroup from "../Pages/AddNewGroup";
import SelectStudentGroup from "../Pages/SelectStudentGroup";
import LoadingComponent from "../Components/LoadingComponent";
import ImageViewerText from "../Pages/ImageViewerText";
import { FlatList } from "react-native-gesture-handler";
import CustomCard3 from "../Components/Elements/CustomCard3";
import { decode } from "base-64";
import ViewGroup from "../Pages/ViewGroup";
import SelectStudentGroupEdit from "../Pages/SelectStudentGroupEdit";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";

type IProps = {
    navigation: any;
};
type IState = {
    // Controller
    isLoading: boolean;
    isError: boolean;
    isRefresh: boolean;
    // Datas
    studentsDatas: {
        curses: OrderCurses[];
        students: StudentsData[];
    };
    datas: GroupsTypes[];
    // Interfaz
    messageError: string;
};

export default class Page6 extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            // Controller
            isLoading: true,
            isError: false,
            isRefresh: false,
            // Datas
            studentsDatas: {
                curses: [],
                students: []
            },
            datas: [],
            // Interfaz
            messageError: ''
        };
        this._openCreate = this._openCreate.bind(this);
        this._nextCreate = this._nextCreate.bind(this);
        this._showSnackbar = this._showSnackbar.bind(this);
        this._showLoading = this._showLoading.bind(this);
        this._showImageViewer = this._showImageViewer.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._goEdit = this._goEdit.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    // Refs Components
    private refAddNewGroup = createRef<AddNewGroup>();
    private refSelectStudentGroup = createRef<SelectStudentGroup>();
    private refLoadingComponent = createRef<LoadingComponent>();
    private refImageViewerText = createRef<ImageViewerText>();
    private refViewGroup = createRef<ViewGroup>();
    private refSelectStudentGroupEdit = createRef<SelectStudentGroupEdit>();
    private refCustomSnackbar = createRef<CustomSnackbar>();

    componentDidMount() {
        this.loadData();
        this.event = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.event2 = DeviceEventEmitter.addListener('p6-reload', (isRefresh?: boolean | undefined)=>this.setState({ isRefresh: !!isRefresh }, this.loadData));
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event2?.remove();
        this.event = null;
        this.event2 = null;
    }
    loadData() {
        var isLoading = !this.state.isRefresh;
        (isLoading)&&this.setState({ datas: [] });
        this.setState({ isLoading, isError: false }, ()=>
            Student.getAll().then((students)=>{
                Groups.getAll()
                    .then((value)=>this.setState({ datas: value, studentsDatas: students, isLoading: false, isRefresh: false }))
                    .catch(({ cause })=>this.setState({ isError: true, isLoading: false, messageError: cause }))
            }).catch(({ cause })=>this.setState({ isError: true, isLoading: false, messageError: cause }))
        );
    }

    // New's
    _openCreate() {
        this.refAddNewGroup.current?.open();
    }
    _nextCreate(curse: string, group: string) {
        var datas = this.state.studentsDatas.curses.find((v)=>v.label == curse);
        if (datas == undefined) return ToastAndroid.show('No se encontró la lista del curso seleccionado', ToastAndroid.SHORT);
        this.refSelectStudentGroup.current?.open(curse, group, datas.students);
    }
    _showSnackbar(snackBarText: string, after?: ()=>any) {
        this.refCustomSnackbar.current?.open(snackBarText);
        return (after)&&after();
    }
    _showLoading(visible: boolean, text: string, after?: ()=>any) {
        if (!visible) {
            this.refLoadingComponent.current?.close();
            return (after)&&after();
        }
        this.refLoadingComponent.current?.open(text);
        return (after)&&after();
    }
    _showImageViewer(src: string, text: string) {
        this.refImageViewerText.current?.open(src, text);
    }
    _openViewGroup(item: GroupsTypes) {
        const students = this.state.studentsDatas.curses.find((v)=>v.label == decode(item.curse));
        if (students) {
            const list = students.students.filter((v)=>!!item.students.find((v2)=>v.id == v2));
            return this.refViewGroup.current?.open(list, decode(item.curse), decode(item.name_group), item.id);
        }
        ToastAndroid.show("Ocurrió un error inesperado", ToastAndroid.SHORT);
    }
    _goEdit(after: StudentsData[], id: string, curse: string) {
        var datas = this.state.studentsDatas.curses.find((v)=>v.label == curse);
        if (datas == undefined) return ToastAndroid.show('No se encontró la lista del curso seleccionado', ToastAndroid.SHORT);
        this.refSelectStudentGroupEdit.current?.open(id, datas.students, after);
    }

    // Flatlist
    _keyExtractor(item: GroupsTypes) {
        return `card-page6-${item.id}`;
    }
    _getItemLayout(_data: GroupsTypes[] | null | undefined, index: number) {
        return {
            length: 54,
            offset: 54 * index,
            index
        }
    }
    _renderItem({ item }: ListRenderItemInfo<GroupsTypes>) {
        return(<CustomCard3
            key={`card-page6-${item.id}`}
            title={`Grupo ${decode(item.name_group)} - ${decode(item.curse)}`}
            onPress={()=>this._openViewGroup(item)}
        />);
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar>
                    <Appbar.Action icon={'menu'} onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Grupos'} />
                    <Appbar.Action icon={'plus'} disabled={this.state.isLoading || this.state.isError} onPress={this._openCreate} />
                </Appbar>
                <View style={{ flex: 2, overflow: 'hidden' }}>
                    {(!this.state.isLoading && !this.state.isError)? <FlatList
                        data={this.state.datas}
                        refreshControl={<RefreshControl refreshing={this.state.isRefresh} colors={[Theme.colors.primary]} onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)} />}
                        keyExtractor={this._keyExtractor}
                        getItemLayout={this._getItemLayout}
                        contentContainerStyle={{ flex: (this.state.datas.length == 0)? 3: undefined, paddingBottom: 11 }}
                        ListEmptyComponent={<ListEmpty />}
                        renderItem={this._renderItem}
                    />:
                    <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                        {(!this.state.isError)? <ActivityIndicator size={'large'} animating />:
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} />
                                <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                                <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={()=>this.setState({ isError: false }, this.loadData)} style={{ marginTop: 12 }} />
                            </View>
                        </View>}
                    </View>}
                </View>
                <CustomSnackbar ref={this.refCustomSnackbar} />

                {/* Modals */}
                <AddNewGroup ref={this.refAddNewGroup} next={this._nextCreate} />
                <SelectStudentGroup
                    ref={this.refSelectStudentGroup}
                    showLoading={this._showLoading}
                    showSnackbar={this._showSnackbar}
                    openImage={this._showImageViewer}
                />
                <SelectStudentGroupEdit
                    ref={this.refSelectStudentGroupEdit}
                    showLoading={this._showLoading}
                    showSnackbar={this._showSnackbar}
                    openImage={this._showImageViewer}
                />
                <ViewGroup
                    ref={this.refViewGroup}
                    showLoading={this._showLoading}
                    showSnackbar={this._showSnackbar}
                    openImage={this._showImageViewer}
                    goEdit={this._goEdit}
                />
                <ImageViewerText ref={this.refImageViewerText} />
                <LoadingComponent ref={this.refLoadingComponent} />
            </PaperProvider>
        </View>);
    }
}

class ListEmpty extends PureComponent {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.emptyContent}>
            <Icon name={'account-alert-outline'} size={48} />
            <Text style={{ marginTop: 12 }}>No se encontraron grupos.</Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    emptyContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    }
});