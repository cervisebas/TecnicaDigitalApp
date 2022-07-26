import { decode } from "base-64";
import React, { Component } from "react";
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

type IProps = {
    navigation: any;
};
type IState = {
    datas: OrderCurses[];
    studentList: StudentsData[];
    showAddNewStudent: boolean;
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;
    // View Details Student
    showDetails: boolean;
    dataDetails: StudentsData | undefined;
    // Viewer Image
    showViewer: boolean;
    imageViewer: ImageSource | undefined;
    // Edit Student
    showEditStudent: boolean;
    dataEditStudent: StudentsData | undefined;
    // Loading component
    showLoading: boolean;
    textLoading: string;
    // Snackbar
    snackBarView: boolean;
    snackBarText: string;
    // Dialogs
    showConfirmDelete: boolean;
    dataConfirmDelete: string;
    // Change Card Design
    showChangeCardDesign: boolean;
    designCardElection: number | undefined;
    // Search Students
    showSearchStudents: boolean;
    // Fab Group
    fabShow: boolean;
    // Generate Multiple Credentials
    visibleOpenGenerator: boolean;
    visibleGeneratorCards: boolean;
    curseIndexGenerator: number | undefined;
    // View Details Assist
    visibleViewDetailsAssist: boolean;
    dataViewDetailsAssist: AssistIndividualData[];
};

export default class Page3 extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            datas: [],
            studentList: [],
            showAddNewStudent: false,
            isLoading: true,
            isRefresh: false,
            isError: false,
            messageError: '',
            showDetails: false,
            dataDetails: undefined,
            showViewer: false,
            imageViewer: undefined,
            showEditStudent: false,
            dataEditStudent: undefined,
            showLoading: false,
            textLoading: '',
            snackBarView: false,
            snackBarText: '',
            showConfirmDelete: false,
            dataConfirmDelete: '',
            showChangeCardDesign: false,
            designCardElection: undefined,
            showSearchStudents: false,
            fabShow: false,
            visibleOpenGenerator: false,
            visibleGeneratorCards: false,
            curseIndexGenerator: undefined,
            visibleViewDetailsAssist: false,
            dataViewDetailsAssist: []
        };
        this.openListGeneratorCredential = this.openListGeneratorCredential.bind(this);
        this._onChangeStateFab = this._onChangeStateFab.bind(this);
        this._renderItem1 = this._renderItem1.bind(this);
        this._renderItem2 = this._renderItem2.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
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
        this.setState({ showLoading: true, textLoading: 'Espere por favor...' }, ()=>
            Student.delete(this.state.dataConfirmDelete)
                .then(()=>this.setState({ showLoading: false, textLoading: '', snackBarView: true, snackBarText: 'Estudiante eliminado con exito', isRefresh: true }, this.loadData))
                .catch((error)=>this.setState({ showLoading: false, textLoading: '', snackBarView: true, snackBarText: error.cause }))
        );
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
        this.setState({ showLoading: true, textLoading: '' }, ()=>{
            var index = this.state.datas.findIndex((v)=>v.label == curse);
            if (index !== -1) {
                this.setState({ showLoading: false, textLoading: '', visibleGeneratorCards: true, curseIndexGenerator: index });
                return;
            }
            this.setState({ showLoading: false, textLoading: '', snackBarView: true, snackBarText: 'No se encontraron alumnos.' });
        });
    }
    _onChangeStateFab({ open }: { open: boolean }) {
        if (this.state.isError) return ToastAndroid.show('No se puede abrir en este momento.', ToastAndroid.SHORT);
        if (this.state.isLoading) return ToastAndroid.show('Espere...', ToastAndroid.SHORT);
        this.setState({ fabShow: open });
    }

    // Flatlist
    _keyExtractor1(item: OrderCurses) {
        return `p3-list-${item.label}`;
    }
    _keyExtractor2(item: StudentsData) {
        return `p3-list-item-${item.id}`;
    }
    _ItemSeparatorComponent2() {
        return(<Divider style={{ marginLeft: 8, marginRight: 8 }} />);
    }
    _renderItem2({ item }: ListRenderItemInfo<StudentsData>) {
        return(<ItemStudent
            key={`p3-list-item-${item.id}`}
            source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
            title={decode(item.name)}
            noLine={true}
            style={{ marginLeft: 8, marginRight: 8 }}
            onPress={()=>this.setState({ showDetails: true, dataDetails: item })}
            onEdit={()=>this.setState({ showEditStudent: true, dataEditStudent: item })}
            onDelete={()=>this.setState({ showConfirmDelete: true, dataConfirmDelete: item.id })}
        />);
    }
    _renderItem1({ item, index }: ListRenderItemInfo<OrderCurses>) {
        return(<CustomList id={index + 1} key={`p3-list-${item.label}`} style={styles.cardsLists} title={(item.label.indexOf('Profesor') !== -1)? item.label: `Curso ${item.label}`}>
            <FlatList
                data={item.students}
                style={{ paddingBottom: 8 }}
                keyExtractor={this._keyExtractor2}
                ItemSeparatorComponent={this._ItemSeparatorComponent2}
                renderItem={this._renderItem2}
            />
        </CustomList>);
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar>
                    <Appbar.Action icon="menu" onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Lista de alumnos'}  />
                    <Appbar.Action disabled={this.state.isLoading || this.state.isError} icon={'magnify'} onPress={()=>this.setState({ showSearchStudents: true })} />
                </Appbar>
                <View style={{ flex: 2, overflow: 'hidden' }}>
                    {(!this.state.isLoading)? (this.state.datas.length != 0)? <View style={{ flex: 3 }}>
                        <List.AccordionGroup>
                            <FlatList
                                data={this.state.datas}
                                extraData={this.state}
                                style={{ paddingTop: 8 }}
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
                <FAB.Group
                    visible
                    open={this.state.fabShow}
                    icon={(!this.state.fabShow)? 'plus': 'close'}
                    actions={[{
                        icon: 'account-plus',
                        label: 'Añadir estudiante',
                        onPress: ()=>this.setState({ showAddNewStudent: true }),
                    }, {
                        icon: 'card-account-details-outline',
                        label: 'Generar credenciales',
                        onPress: ()=>this.setState({ visibleOpenGenerator: true })
                    }]}
                    onStateChange={this._onChangeStateFab}
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
                    visible={this.state.showSearchStudents}
                    close={()=>this.setState({ showSearchStudents: false })}
                    list={this.state.studentList}
                    openDetails={(data)=>this.setState({ showDetails: true, dataDetails: data })}
                    onEdit={(data)=>this.setState({ showEditStudent: true, dataEditStudent: data })}
                    onDelete={(studentId)=>this.setState({ showConfirmDelete: true, dataConfirmDelete: studentId })}
                />
                <OpenGenerateMultipleCards
                    visible={this.state.visibleOpenGenerator}
                    close={(i)=>this.setState({ visibleOpenGenerator: false }, ()=>(i)&&this.setState({ designCardElection: undefined }))}
                    openChangeDesing={()=>this.setState({ showChangeCardDesign: true })}
                    openListCrendentials={this.openListGeneratorCredential}
                />
                <GenerateMultipleCards
                    visible={this.state.visibleGeneratorCards}
                    close={()=>this.setState({ visibleGeneratorCards: false, designCardElection: undefined })}
                    datas={(this.state.curseIndexGenerator !== undefined)? this.state.datas[this.state.curseIndexGenerator].students: undefined}
                    type={this.state.designCardElection}
                    showLoading={(v, t, a)=>this.setState({ showLoading: v, textLoading: t }, ()=>(a)&&a())}
                />
                <AddNewStudent
                    visible={this.state.showAddNewStudent}
                    close={()=>this.setState({ showAddNewStudent: false })}
                />
                <EditStudent
                    visible={this.state.showEditStudent}
                    data={this.state.dataEditStudent}
                    close={()=>this.setState({ showEditStudent: false, dataEditStudent: undefined })}
                />
                <ViewDetails
                    visible={this.state.showDetails}
                    data={this.state.dataDetails}
                    designCard={this.state.designCardElection}
                    close={()=>this.setState({ showDetails: false, dataDetails: undefined, designCardElection: undefined })}
                    openImage={(data)=>this.setState({ showViewer: true, imageViewer: data })}
                    openDetailsAssist={(data)=>this.setState({ visibleViewDetailsAssist: true, dataViewDetailsAssist: data })}
                    changeDesign={()=>this.setState({ showChangeCardDesign: true })}
                    goLoading={(v, t, a)=>this.setState({ showLoading: v, textLoading: t }, ()=>(a)&&a())}
                />
                {(this.state.showDetails || this.state.visibleOpenGenerator)&&<>
                    <ChangeCardDesign
                        visible={this.state.showChangeCardDesign}
                        close={()=>this.setState({ showChangeCardDesign: false })}
                        onPress={(option)=>this.setState({ designCardElection: option, showChangeCardDesign: false })}
                    />
                </>}
                {(this.state.showDetails)&&<>
                    <ImageView
                        images={(this.state.imageViewer)? [this.state.imageViewer]: []}
                        imageIndex={0}
                        visible={this.state.showViewer}
                        swipeToCloseEnabled={true}
                        doubleTapToZoomEnabled={true}
                        onRequestClose={()=>this.setState({ showViewer: false, imageViewer: undefined })}
                    />
                    <ViewDetailsAssist
                        visible={this.state.visibleViewDetailsAssist}
                        close={()=>this.setState({ visibleViewDetailsAssist: false, dataViewDetailsAssist: [] })}
                        datas={this.state.dataViewDetailsAssist}
                    />
                </>}
                <LoadingController visible={this.state.showLoading} loadingText={this.state.textLoading} indicatorColor={Theme.colors.accent} />
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
        bottom: 0,
    }
});