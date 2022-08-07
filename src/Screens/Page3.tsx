import { decode } from "base-64";
import React, { Component, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, ToastAndroid, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Dialog, Divider, FAB, IconButton, List, Paragraph, Portal, Provider as PaperProvider, Snackbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomList from "../Components/Elements/CustomList";
import AddNewStudent from "../Pages/AddNewStudent";
import ViewDetails from "../Pages/ViewDetails";
import { Student, urlBase } from "../Scripts/ApiTecnica";
import { AssistIndividualData, OrderCurses, StudentsData } from "../Scripts/ApiTecnica/types";
import ImageView from "react-native-image-viewing";
import Theme from "../Themes";
import { ImageSource } from "react-native-image-viewing/dist/@types";
import EditStudent from "../Pages/EditStudent";
import LoadingController from "../Components/loading/loading-controller";
import ChangeCardDesign from "../Pages/ChangeCardDesign";
import ItemStudent from "../Components/Elements/CustomItem";
import SearchStudents from "../Pages/SearchStudents";
import OpenGenerateMultipleCards from "../Pages/OpenGenerateMultipleCards";
import GenerateMultipleCards from "../Pages/GenerateMultipleCards";
import ViewDetailsAssist from "../Pages/ViewDetailsAssist";
import ImageViewer from "../Pages/ImageViewer";
import FABPage3 from "../Components/FAB_Page3";
import LoadingComponent from "../Components/LoadingComponent";

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
    // Snackbar
    snackBarView: boolean;
    snackBarText: string;
    // Dialogs
    showConfirmDelete: boolean;
    dataConfirmDelete: string;
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
            snackBarView: false,
            snackBarText: '',
            showConfirmDelete: false,
            dataConfirmDelete: ''
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
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private designCardElection: number | undefined = undefined;
    private designCardElection2: number | undefined = undefined;
    // Refs Components
    private refSearchStudents: SearchStudents | null = null;
    private refOpenGenerateMultipleCards: OpenGenerateMultipleCards | null = null;
    private refGenerateMultipleCards: GenerateMultipleCards | null = null;
    private refAddNewStudent: AddNewStudent | null = null;
    private refEditStudent: EditStudent | null = null;
    private refViewDetails: ViewDetails | null = null;
    private refChangeCardDesign: ChangeCardDesign | null = null;
    private refImageViewer: ImageViewer | null = null;
    private refViewDetailsAssist: ViewDetailsAssist | null = null;
    private refLoadingComponent: LoadingComponent | null = null;

    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('reloadPage3', (isRefresh?: boolean | undefined)=>this.setState({ isRefresh: !!isRefresh }, this.loadData));
        this.event2 = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.loadData();
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event2?.remove();
        this.event = null;
        this.event2 = null;
    }
    deleteStudent() {
        this.refLoadingComponent?.open('Espere por favor...');
        Student.delete(this.state.dataConfirmDelete)
            .then(()=>{
                this.refLoadingComponent?.close();
                this.setState({ snackBarView: true, snackBarText: 'Estudiante eliminado con exito', isRefresh: true }, this.loadData);
            })
            .catch((error)=>{
                this.refLoadingComponent?.close();
                this.setState({ snackBarView: true, snackBarText: error.cause });
            });
    }
    loadData() {
        var isLoading = !this.state.isRefresh;
        (isLoading)&&this.setState({ datas: [] });
        this.setState({ isLoading, isError: false }, ()=>
            Student.getAll()
                .then((value)=>this.setState({ datas: value.curses, studentList: value.students, isLoading: false, isRefresh: false }))
                .catch((error)=>this.setState({ isLoading: true, isError: true, messageError: error.cause, isRefresh: false }))
        );
    }
    openListGeneratorCredential(curse: string) {
        var index = this.state.datas.findIndex((v)=>v.label == curse);
        if (index !== -1) return this.refGenerateMultipleCards?.open(this.state.datas[index].students, this.designCardElection2);
        this.refLoadingComponent?.close();
        this.setState({ snackBarView: true, snackBarText: 'No se encontraron alumnos.' });
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
            noLine={true}
            style={styles.marginList2}
            onPress={()=>this._openViewDetails(item)}
            onEdit={()=>this._openEditStudent(item)}
            onDelete={()=>this.setState({ showConfirmDelete: true, dataConfirmDelete: item.id })}
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
        return(<CustomList id={index + 1} key={`p3-list-${item.label}`} style={styles.cardsLists} title={(item.label.indexOf('Profesor') !== -1 || item.label.indexOf('Archivado') !== -1)? item.label: `Curso ${item.label}`}>
            <FlatList
                data={item.students}
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
        this.refSearchStudents?.open(this.state.studentList);
    }
    _openEditStudent(data: StudentsData) {
        this.refEditStudent?.open(data);
    }
    _goLoading(visible: boolean, text: string, after?: ()=>any) {
        if (!visible) {
            this.refLoadingComponent?.close();
            return (after)&&after();
        }
        this.refLoadingComponent?.open(text);
        (after)&&after();
    }
    _openViewDetails(data: StudentsData) {
        this.refViewDetails?.open(data, this.designCardElection);
    }
    _openChangeCardDesign() {
        this.refChangeCardDesign?.open();
    }
    _onChangeCardDesign(election: number | undefined) {
        if (this.refOpenGenerateMultipleCards?.state.visible) return this.designCardElection2 = election;
        this.designCardElection = election;
        (this.refViewDetails?.state.visible)&&this.refViewDetails.updateCardDesign(election);
    }
    _openGenerateMultipleCards() {
        this.designCardElection2 = undefined;
        this.refOpenGenerateMultipleCards?.open();
    }
    _openViewerImage(source: { uri: string }) {
        this.refImageViewer?.open(source.uri);
    }
    _openDetailsAssist(data: AssistIndividualData[]) {
        this.refViewDetailsAssist?.open(data);
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
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
                                    colors={[Theme.colors.primary]}
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
                                <Icon name={'format-list-text'} size={48} style={{ fontSize: 48 }} />
                                <Text style={{ marginTop: 14 }}>La lista esta vacía</Text>
                                <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={()=>this.setState({ isRefresh: true, isError: false }, ()=>this.loadData())} style={{ marginTop: 12 }} />
                            </View>
                        </View>
                    </View>:
                    <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                        {(!this.state.isError)? <ActivityIndicator size={'large'} animating />:
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} />
                                <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                                <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={()=>this.setState({ isRefresh: true, isError: false }, this.loadData)} style={{ marginTop: 12 }} />
                            </View>
                        </View>}
                    </View>}
                </View>
                <FABPage3
                    disable={this.state.isLoading || this.state.isError}
                    onAddNewStudent={()=>this.refAddNewStudent?.open()}
                    onGenerateMultipleCards={this._openGenerateMultipleCards}
                />
                <Snackbar
                    visible={this.state.snackBarView}
                    onDismiss={()=>this.setState({ snackBarView: false })}
                    action={{ label: 'OCULTAR', onPress: ()=>this.setState({ snackBarView: false }) }}>
                    <Text>{this.state.snackBarText}</Text>
                </Snackbar>
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
                </Portal>

                {/*##### Modal's #####*/}
                <SearchStudents
                    ref={(ref)=>this.refSearchStudents = ref}
                    openDetails={this._openViewDetails}
                    onEdit={this._openEditStudent}
                    onDelete={(studentId)=>this.setState({ showConfirmDelete: true, dataConfirmDelete: studentId })}
                />
                <OpenGenerateMultipleCards
                    ref={(ref)=>this.refOpenGenerateMultipleCards = ref}
                    openChangeDesing={this._openChangeCardDesign}
                    openListCrendentials={this.openListGeneratorCredential}
                />
                <GenerateMultipleCards ref={(ref)=>this.refGenerateMultipleCards = ref} />
                <AddNewStudent ref={(ref)=>this.refAddNewStudent = ref} />
                <EditStudent ref={(ref)=>this.refEditStudent = ref} />
                <ViewDetails
                    ref={(ref)=>this.refViewDetails = ref}
                    openImage={this._openViewerImage}
                    openDetailsAssist={this._openDetailsAssist}
                    changeDesign={this._openChangeCardDesign}
                    goLoading={this._goLoading}
                />
                <ChangeCardDesign ref={(ref)=>this.refChangeCardDesign = ref} onChange={this._onChangeCardDesign} />                
                <ImageViewer ref={(ref)=>this.refImageViewer = ref} />
                <ViewDetailsAssist ref={(ref)=>this.refViewDetailsAssist = ref} />
                <LoadingComponent ref={(ref)=>this.refLoadingComponent = ref} />
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