import { decode } from "base-64";
import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Dialog, Divider, IconButton, List, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomList from "../Components/Elements/CustomList";
import AddNewStudent from "../Pages/AddNewStudent";
import ViewDetails from "../Pages/ViewDetails";
import { Student, urlBase } from "../Scripts/ApiTecnica";
import { AssistIndividualData, OrderCurses, StudentsData } from "../Scripts/ApiTecnica/types";
import EditStudent from "../Pages/EditStudent";
import ChangeCardDesign from "../Pages/ChangeCardDesign";
import ItemStudent from "../Components/Elements/CustomItem";
import SearchStudents from "../Pages/SearchStudents";
import OpenGenerateMultipleCards from "../Pages/OpenGenerateMultipleCards";
import GenerateMultipleCards from "../Pages/GenerateMultipleCards";
import ViewDetailsAssist from "../Pages/ViewDetailsAssist";
import ImageViewer from "../Pages/ImageViewer";
import FABPage3 from "../Components/FAB_Page3";
import LoadingComponent from "../Components/LoadingComponent";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import moment from "moment";
import { ThemeContext } from "../Components/ThemeProvider";

type IProps = {
    navigation: any;
};
type IState = {
    datas: OrderCurses[];
    studentList: StudentsData[];
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;
    // Dialogs
    showConfirmDelete: boolean;
    showConfirmArchive: boolean;
};

export default class Page3 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            datas: [],
            studentList: [],
            isLoading: true,
            isRefresh: false,
            isError: false,
            messageError: '',
            showConfirmDelete: false,
            showConfirmArchive: false
        };
        this.openListGeneratorCredential = this.openListGeneratorCredential.bind(this);
        this._renderItem1 = this._renderItem1.bind(this);
        this._renderItem2 = this._renderItem2.bind(this);
        this._openSearch = this._openSearch.bind(this);
        this._openEditStudent = this._openEditStudent.bind(this);
        this._goLoading = this._goLoading.bind(this);
        this._openViewDetails = this._openViewDetails.bind(this);
        this._openChangeCardDesign = this._openChangeCardDesign.bind(this);
        this._onChangeCardDesign = this._onChangeCardDesign.bind(this);
        this._openGenerateMultipleCards = this._openGenerateMultipleCards.bind(this);
        this._openViewerImage = this._openViewerImage.bind(this);
        this._openDetailsAssist = this._openDetailsAssist.bind(this);
        this._setIndexActionSheet1 = this._setIndexActionSheet1.bind(this);
        this._openActionSheet1 = this._openActionSheet1.bind(this);
        this._setIndexActionSheet2 = this._setIndexActionSheet2.bind(this);
        this._openActionSheet2 = this._openActionSheet2.bind(this);
        this._onChangeCurseInGenerateMultipleCredentials = this._onChangeCurseInGenerateMultipleCredentials.bind(this);
        this._showSnackbar = this._showSnackbar.bind(this);
        this.archiveStudent = this.archiveStudent.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private designCardElection: number | undefined = undefined;
    private designCardElection2: number | undefined = undefined;
    private delimitesVip: number[] = [5, 23];
    private dataConfirmDelete: string = '-1';
    private dataConfirmArchive: string = '-1';
    static contextType = ThemeContext;
    // Refs Components
    private refSearchStudents = createRef<SearchStudents>();
    private refOpenGenerateMultipleCards = createRef<OpenGenerateMultipleCards>();
    private refGenerateMultipleCards = createRef<GenerateMultipleCards>();
    private refAddNewStudent = createRef<AddNewStudent>();
    private refEditStudent = createRef<EditStudent>();
    private refViewDetails = createRef<ViewDetails>();
    private refChangeCardDesign = createRef<ChangeCardDesign>();
    private refImageViewer = createRef<ImageViewer>();
    private refViewDetailsAssist = createRef<ViewDetailsAssist>();
    private refLoadingComponent = createRef<LoadingComponent>();
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refActionSheet1 = createRef<ActionSheet>();
    private refActionSheet2 = createRef<ActionSheet>();

    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('reloadPage3', (isRefresh?: boolean | undefined)=>this.setState({ isRefresh: !!isRefresh }, this.loadData));
        this.event2 = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.loadData();
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event2?.remove();
    }
    deleteStudent() {
        this.refLoadingComponent.current?.open('Espere por favor...');
        Student.delete(this.dataConfirmDelete)
            .then(()=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open('Estudiante eliminado con exito');
                this.setState({ isRefresh: true }, this.loadData);
            })
            .catch((error)=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }
    archiveStudent() {
        this.refLoadingComponent.current?.open('Espere por favor...');
        Student.archive(this.dataConfirmArchive)
            .then(()=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open('Estudiante archivado con exito');
                this.setState({ isRefresh: true }, this.loadData);
            })
            .catch((error)=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }
    loadData() {
        var isLoading = !this.state.isRefresh;
        (isLoading)&&this.setState({ datas: [] });
        if (this.refSearchStudents.current?.state.visible) this.refSearchStudents.current.updateList(true);
        this.setState({ isLoading, isError: false }, ()=>
            Student.getAll()
                .then((value)=>{
                    this.setState({
                        datas: value.curses,
                        studentList: value.students,
                        isLoading: false,
                        isRefresh: false
                    });
                    if (this.refSearchStudents.current?.state.visible) this.refSearchStudents.current.updateList(false, value.students);
                })
                .catch((error)=>this.setState({ isLoading: true, isError: true, messageError: error.cause, isRefresh: false }))
        );
    }
    openListGeneratorCredential(curse: string) {
        const index = this.state.datas.findIndex((v)=>v.label.indexOf(curse) !== -1 || curse.indexOf(v.label) !== -1);
        if (index !== -1) return this.refGenerateMultipleCards.current?.open(this.state.datas[index].students, this.designCardElection2);
        this.refLoadingComponent.current?.close();
        this.refCustomSnackbar.current?.open('No se encontraron alumnos.');
    }

    // Flatlist
    _keyExtractor1(item: OrderCurses) {
        return `p3-list-${item.label}`;
    }
    _keyExtractor2(item: StudentsData) {
        return `p3-list-item-${item.id}`;
    }
    _ItemSeparatorComponent2() {
        return(<Divider style={styles.marginList2} />);
    }
    _renderItem2({ item }: ListRenderItemInfo<StudentsData>) {
        return(<ItemStudent
            key={`p3-list-item-${item.id}`}
            source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
            title={decode(item.name)}
            isArchive={decode(item.curse) == 'Archivados'}
            noLine={true}
            style={styles.marginList2}
            onPress={()=>this._openViewDetails(item)}
            onEdit={()=>this._openEditStudent(item)}
            onArchive={()=>this.setState({ showConfirmArchive: true }, ()=>this.dataConfirmArchive = item.id)}
            onDelete={()=>this.setState({ showConfirmDelete: true }, ()=>this.dataConfirmDelete = item.id)}
        />);
    }
    _getItemLayout2(_data: StudentsData[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * index,
            index
        };
    }
    _renderItem1({ item, index }: ListRenderItemInfo<OrderCurses>) {
        return(<CustomList
            id={index + 1}
            key={`p3-list-${item.label}`}
            style={styles.cardsLists}
            title={(item.label.indexOf('Archivado') !== -1)?
                item.label:
                (item.label.indexOf('Docente') !== -1 || item.label.indexOf('Profesor') !== -1)?
                    'Docentes':
                    `Curso ${item.label}`
            }
            leght={item.students.length}>
            <FlatList
                data={item.students}
                extraData={item}
                style={{ paddingBottom: 8 }}
                keyExtractor={this._keyExtractor2}
                ItemSeparatorComponent={this._ItemSeparatorComponent2}
                getItemLayout={this._getItemLayout2}
                renderItem={this._renderItem2}
            />
        </CustomList>);
    }

    // New
    _openSearch() {
        this.refSearchStudents.current?.open(this.state.studentList);
    }
    _openEditStudent(data: StudentsData) {
        this.refEditStudent.current?.open(data);
    }
    _goLoading(visible: boolean, text?: string, after?: ()=>any) {
        if (!visible) {
            this.refLoadingComponent.current?.close();
            return (after)&&after();
        }
        this.refLoadingComponent.current?.open(text!);
        (after)&&after();
    }
    _openViewDetails(data: StudentsData) {
        const isVip = (decode(data.curse).indexOf('7°') !== -1) && (moment().format("YYYY") == "2022");
        const designIsVip = !!this.delimitesVip.find((v)=>v == this.designCardElection);
        const setDesign = (designIsVip)? (isVip)? this.designCardElection: undefined: this.designCardElection;
        this.refViewDetails.current?.open(data, setDesign);
    }
    _openChangeCardDesign(isVip?: boolean) {
        this.refChangeCardDesign.current?.open(isVip);
    }
    _onChangeCardDesign(election: number | undefined) {
        if (this.refOpenGenerateMultipleCards.current?.state.visible) return this.designCardElection2 = election;
        this.designCardElection = election;
        (this.refViewDetails.current?.state.visible)&&this.refViewDetails.current.updateCardDesign(election);
    }
    _openGenerateMultipleCards() {
        this.designCardElection2 = undefined;
        this.refOpenGenerateMultipleCards.current?.open();
    }
    _openViewerImage(source: { uri: string }) {
        this.refImageViewer.current?.open(source.uri);
    }
    _openDetailsAssist(data: AssistIndividualData[]) {
        this.refViewDetailsAssist.current?.open(data);
    }
    // AddNewStudent ActionSheet
    _openActionSheet1() {
        this.refActionSheet1.current?.show();
    }
    _setIndexActionSheet1(index: number) {
        this.refAddNewStudent.current?.actionAddPicture(index);
    }
    // EditStudent ActionSheet
    _openActionSheet2() {
        this.refActionSheet2.current?.show();
    }
    _setIndexActionSheet2(index: number) {
        this.refEditStudent.current?.actionSetPicture(index);
    }
    // Others
    _onChangeCurseInGenerateMultipleCredentials(curse: string) {
        const isVip = (curse.indexOf('7°') !== -1) && (moment().format("YYYY") == "2022");
        const designIsVip = !!this.delimitesVip.find((v)=>v == this.designCardElection2);
        const setDesign = (designIsVip)? (isVip)? this.designCardElection: undefined: this.designCardElection;
        this.designCardElection2 = setDesign;
    }
    _showSnackbar(message: string, visible?: boolean) {
        if (visible == false) return this.refCustomSnackbar.current?.close();
        this.refCustomSnackbar.current?.open(message);
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={theme}>
                <Appbar>
                    <Appbar.Action icon="menu" onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Lista de alumnos'}  />
                    <Appbar.Action disabled={this.state.isLoading || this.state.isError} icon={'magnify'} onPress={this._openSearch} />
                </Appbar>
                <View style={{ flex: 2, overflow: 'hidden' }}>
                    {(!this.state.isLoading)? (this.state.datas.length != 0)? <View style={{ flex: 3 }}>
                        <List.AccordionGroup>
                            <FlatList
                                data={this.state.datas}
                                extraData={this.state}
                                contentContainerStyle={styles.listStyle}
                                refreshControl={<RefreshControl
                                    refreshing={this.state.isRefresh}
                                    colors={[theme.colors.primary]}
                                    progressBackgroundColor={theme.colors.surface}
                                    onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)}
                                />}
                                keyExtractor={this._keyExtractor1}
                                renderItem={this._renderItem1}
                            />
                        </List.AccordionGroup>
                    </View>: 
                    <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                <Icon name={'format-list-text'} size={48} color={theme.colors.text} style={{ fontSize: 48 }} />
                                <Text style={{ marginTop: 14 }}>La lista esta vacía</Text>
                                <IconButton icon={'reload'} color={theme.colors.primary} size={28} onPress={()=>this.setState({ isRefresh: true, isError: false }, ()=>this.loadData())} style={{ marginTop: 12 }} />
                            </View>
                        </View>
                    </View>:
                    <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                        {(!this.state.isError)? <ActivityIndicator size={'large'} animating />:
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                <Icon name={'account-alert-outline'} size={48} color={theme.colors.text} style={{ fontSize: 48 }} />
                                <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                                <IconButton icon={'reload'} color={theme.colors.primary} size={28} onPress={()=>this.setState({ isRefresh: true, isError: false }, this.loadData)} style={{ marginTop: 12 }} />
                            </View>
                        </View>}
                    </View>}
                </View>
                <FABPage3
                    disable={this.state.isLoading || this.state.isError}
                    onAddNewStudent={()=>this.refAddNewStudent.current?.open()}
                    onGenerateMultipleCards={this._openGenerateMultipleCards}
                />
                <CustomSnackbar ref={this.refCustomSnackbar} />
                <Portal>
                    <Dialog visible={this.state.showConfirmDelete} onDismiss={()=>this.setState({ showConfirmDelete: false })}>
                        <Dialog.Title>Confirmar por favor</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Realizar esta acción es irreversible, por favor confirme si en verdad está seguro/a.</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={()=>this.setState({ showConfirmDelete: false })}>Cancelar</Button>
                            <Button onPress={()=>this.setState({ showConfirmDelete: false }, this.deleteStudent)}>Aceptar</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog visible={this.state.showConfirmArchive} onDismiss={()=>this.setState({ showConfirmArchive: false })}>
                        <Dialog.Title>Espere por favor</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>¿Estás seguro/a que desea realizar esta acción? Esta acción si es reversible.</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={()=>this.setState({ showConfirmArchive: false })}>Cancelar</Button>
                            <Button onPress={()=>this.setState({ showConfirmArchive: false }, this.archiveStudent)}>Aceptar</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/*##### Modal's #####*/}
                <ActionSheet
                    ref={this.refActionSheet1}
                    title={'Elije una opción'}
                    options={['Cámara', 'Galería', 'Cancelar']}
                    cancelButtonIndex={2}
                    destructiveButtonIndex={2}
                    userInterfaceStyle={(isDark)? 'dark': 'light'}
                    onPress={this._setIndexActionSheet1}
                />
                <ActionSheet
                    ref={this.refActionSheet2}
                    title={'Elije una opción'}
                    options={['Cámara', 'Galería', 'Quitar', 'Cancelar']}
                    cancelButtonIndex={3}
                    destructiveButtonIndex={3}
                    userInterfaceStyle={(isDark)? 'dark': 'light'}
                    onPress={this._setIndexActionSheet2}
                />
                <SearchStudents
                    ref={this.refSearchStudents}
                    openDetails={this._openViewDetails}
                    onEdit={this._openEditStudent}
                    onDelete={(studentId)=>this.setState({ showConfirmDelete: true }, ()=>this.dataConfirmDelete = studentId)}
                    isLoading={this.state.isLoading || this.state.isRefresh}
                />
                <OpenGenerateMultipleCards
                    ref={this.refOpenGenerateMultipleCards}
                    openChangeDesing={this._openChangeCardDesign}
                    openListCrendentials={this.openListGeneratorCredential}
                    onChangeCurse={this._onChangeCurseInGenerateMultipleCredentials}
                />
                <GenerateMultipleCards ref={this.refGenerateMultipleCards} />
                <AddNewStudent
                    ref={this.refAddNewStudent}
                    goEditActionSheet={this._openActionSheet1}
                />
                <EditStudent
                    ref={this.refEditStudent}
                    showSnackbar={this._showSnackbar}
                    goEditActionSheet={this._openActionSheet2}
                />
                <ViewDetails
                    ref={this.refViewDetails}
                    openImage={this._openViewerImage}
                    openDetailsAssist={this._openDetailsAssist}
                    changeDesign={this._openChangeCardDesign}
                    goLoading={this._goLoading}
                    editNow={this._openEditStudent}
                />
                <ChangeCardDesign ref={this.refChangeCardDesign} onChange={this._onChangeCardDesign} />                
                <ImageViewer ref={this.refImageViewer} />
                <ViewDetailsAssist ref={this.refViewDetailsAssist} />
                <LoadingComponent ref={this.refLoadingComponent} />
            </PaperProvider>
        </View>);
    }
}

const styles = StyleSheet.create({
    cardList: {
        marginLeft: 8,
        marginRight: 8,
        marginTop: -8,
        paddingTop: 8,
        marginBottom: 8,
        elevation: 0,
        zIndex: 0,
        borderColor: '#BDBDBD',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden'
    },
    cardsLists: {
        elevation: 3,
        zIndex: 3
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0
    },
    listStyle: {
        paddingTop: 8,
        paddingBottom: 80
    },
    marginList2: {
        marginLeft: 8,
        marginRight: 8
    }
});