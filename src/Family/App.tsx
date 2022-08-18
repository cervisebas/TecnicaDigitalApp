import React, { Component, createRef } from "react";
import { DeviceEventEmitter, Dimensions, EmitterSubscription, PermissionsAndroid, RefreshControl, ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ActivityIndicator, Appbar, Button, Card, Dialog, IconButton, Paragraph, Portal, Provider as PaperProvider, Snackbar, Text } from "react-native-paper";
import Theme from "../Themes";
import messaging from '@react-native-firebase/messaging';
import { Family, urlBase } from "../Scripts/ApiTecnica";
import { FamilyDataAssist, StudentsData } from "../Scripts/ApiTecnica/types";
import { decode } from "base-64";
import ViewDetailsAssist from "../Pages/ViewDetailsAssist";
import CustomCredential from "../Components/CustomCredential";
import ViewShot, { captureRef } from "react-native-view-shot";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import ChangeCardDesign from "../Pages/ChangeCardDesign";
import FamilyOptions from "../Pages/FamilyOptions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainWidget from "../Scripts/MainWidget";
import ImageViewer from "../Pages/ImageViewer";
import LoadingComponent from "../Components/LoadingComponent";
import QueryCall from "./Components/QueryCall";
import WelcomeCard from "./Components/WelcomeCard";
import SupportCard from "./Components/SupportCard";
import AssistCard from "./Components/AssistCard";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";

type IProps = {};
type IState = {
    // Controller
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;
    // Data Student
    studentData: StudentsData | undefined;
    // Assist
    isLoadingAssist: boolean;
    isErrorAssist: boolean;
    messageErrorAssist: string;
    assistData: FamilyDataAssist[] | undefined;
    numAssist: string;
    numNotAssist: string;
    numTotalAssist: string;
    disableButtonDetailAssist: boolean;
    // Card
    scaleImage: number;
    designCardElection: number | undefined;
    // Interfaz
    dialogVisible: boolean;
    dialogTitle: string;
    dialogText: string;
    viewLogOut: boolean;
};

const { width } = Dimensions.get('window');

export default class AppFamily extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: false,
            isRefresh: false,
            isError: false,
            messageError: '',
            studentData: undefined,
            isLoadingAssist: true,
            isErrorAssist: false,
            messageErrorAssist: '',
            assistData: undefined,
            numAssist: 'Cargando...',
            numNotAssist: 'Cargando...',
            numTotalAssist: 'Cargando...',
            scaleImage: 0.3,
            designCardElection: undefined,
            viewLogOut: false,
            disableButtonDetailAssist: false,
            dialogVisible: false,
            dialogTitle: '',
            dialogText: ''
        };
        this.loadData = this.loadData.bind(this);
        this.loadDataAssist = this.loadDataAssist.bind(this);
        this.viewImageTarget = this.viewImageTarget.bind(this);
        this.downloadImageTarget = this.downloadImageTarget.bind(this);
        this.shareImageTarget = this.shareImageTarget.bind(this);
        this.closeSession = this.closeSession.bind(this);
        this._openDetailsAssit = this._openDetailsAssit.bind(this);
        this._openChangeDesign = this._openChangeDesign.bind(this);
        this._openImageViewer = this._openImageViewer.bind(this);
        this._openOptions = this._openOptions.bind(this);
        this._support_open_phone = this._support_open_phone.bind(this);
        this._onChangeCardDesign = this._onChangeCardDesign.bind(this);
    }
    private event: EmitterSubscription | null = null;
    // Refs Components
    private refTarget: ViewShot | null | any = null;
    private refChangeCardDesign = createRef<ChangeCardDesign>();
    private refImageViewer = createRef<ImageViewer>();
    private refViewDetailsAssist = createRef<ViewDetailsAssist>();
    private refLoadingComponent = createRef<LoadingComponent>();
    private refFamilyOptions = createRef<FamilyOptions>();
    private refQueryCall = createRef<QueryCall>();
    private refCustomSnackbar = createRef<CustomSnackbar>();

    componentDidMount() {
        var scales: number[] = [];
        for (let i = 1; i > 0; i -= 0.001) { scales.push(i); }
        var scaleUse: number = 0;
        scales.forEach((val)=>(((1200 * val) < (width - 56)) && scaleUse == 0) && (scaleUse = val));
        this.setState({ scaleImage: scaleUse });
        this.event = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.loadData();
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event = null;
    }
    loadDataAssist() {
        this.setState({ isLoadingAssist: true, isErrorAssist: false, numAssist: 'Cargando...', numNotAssist: 'Cargando...', numTotalAssist: 'Cargando...', disableButtonDetailAssist: false }, ()=>
            Family.getDataAssistStudent()
                .then(async(data)=>{
                    var assists: number = 0;
                    var notAssists: number = 0;
                    var disable: boolean = false;
                    data.forEach((v)=>(v.status)? assists += 1: notAssists += 1);
                    disable = data.length == 0;
                    MainWidget.setNewData(assists, notAssists, data.length);
                    this.setState({
                        isLoadingAssist: false,
                        assistData: data,
                        numAssist: assists.toString(),
                        numNotAssist: notAssists.toString(),
                        numTotalAssist: data.length.toString(),
                        disableButtonDetailAssist: disable
                    });
                })
                .catch((error)=>this.setState({ isLoadingAssist: false, isErrorAssist: true, messageErrorAssist: error.cause }))
        );
    }
    loadData() {
        this.setState({ isLoading: true, isError: false, studentData: undefined, designCardElection: undefined }, ()=>
            Family.getDataStudent()
                .then((v)=>this.setState({ isLoading: false, studentData: v }, this.loadDataAssist))
                .catch((v)=>this.setState({ isLoading: true, isError: true, messageError: v.cause }))
        );
    }


    /* ###### Credential ###### */
    generateImage(result?: "tmpfile" | "base64" | "data-uri" | "zip-base64" | undefined): Promise<string> {
        return new Promise((resolve, reject)=>{
            captureRef(this.refTarget, { quality: 1, format: 'png', result: (result)? result: 'tmpfile' })
                .then((uri)=>resolve(uri))
                .catch(()=>reject());
        });
    }
    viewImageTarget() {
        this.generateImage()
            .then(this._openImageViewer)
            .catch(()=>this.refCustomSnackbar.current?.open('Error al generar la imagen.'));
    }
    async downloadImageTarget() {
        const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
            title: "Atención",
            message: "Para guardar la imagen se necesita acceder al almacenamiento de su dispositivo, por favor acepte los permisos que se requieren.",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar"
        });
        if (permission == PermissionsAndroid.RESULTS.DENIED) return this.refCustomSnackbar.current?.open('Se denegó el acceso al almacenamiento.');
        this.generateImage()
            .then((uri)=>{
                var codeName: number = Math.floor(Math.random() * (99999 - 10000)) + 10000;
                var nameFile: string = `student-${this.state.studentData!.id}`;
                nameFile += `-credential-${codeName}`;
                RNFS.copyFile(uri, `${RNFS.DownloadDirectoryPath}/${nameFile}.png`)
                    .then(()=>this.refCustomSnackbar.current?.open('Imagen guardada con éxito'))
                    .catch(()=>this.refCustomSnackbar.current?.open('Error al guardar la imagen'));
            })
            .catch(()=>this.refCustomSnackbar.current?.open('Error al generar la imagen.'));
    }
    shareImageTarget() {
        this.refLoadingComponent.current?.open('Espere por favor...');
        this.generateImage('base64')
            .then((base64)=>{
                var nameFile: string = `student-${this.state.studentData!.id}-credential-${Math.floor(Math.random() * (99999 - 10000)) + 10000}.png`;
                this.refLoadingComponent.current?.close();
                Share.open({
                    url: `data:image/png;base64,${base64}`,
                    filename: nameFile,
                    type: 'png',
                    showAppsToView: false,
                    isNewTask: true
                }).catch(()=>this.refCustomSnackbar.current?.open('Acción cancelada por el usuario.'));
            })
            .catch(()=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open('Error al generar la imagen.');
            });
    }
    /* ###### ########## ###### */
    _openDetailsAssit() {
        if (this.state.assistData!.length == 0) return ToastAndroid.show("No se encontraron registros...", ToastAndroid.SHORT);
        this.refViewDetailsAssist.current?.open(this.state.assistData as any);
    }
    closeSession() {
        this.refLoadingComponent.current?.open('Cerrando sesión...');
        this.setState({ viewLogOut: false }, async()=>{
            await messaging().unsubscribeFromTopic(`student-${this.state.studentData!.id}`);
            await AsyncStorage.multiRemove(['FamilySession', 'FamilyOptionSuscribe', 'AssistData']);
            await MainWidget.init();
            this.refLoadingComponent.current?.close();
            DeviceEventEmitter.emit('reVerifySession');
        });
    }

    // New's
    _openChangeDesign() {
        this.refChangeCardDesign.current?.open();
    }
    _openImageViewer(src: string) {
        this.refImageViewer.current?.open(src);
    }
    _openOptions() {
        this.refFamilyOptions.current?.open();
    }
    _onChangeCardDesign(option: number | undefined) {
        this.setState({ designCardElection: option });
    }

    // Support
    _support_open_phone() {
        this.refQueryCall.current?.open();
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar.Header>
                    <Appbar.Content title={'TecnicaDigital'} />
                    <Appbar.Action icon={'account-circle-outline'} disabled={this.state.isLoading} onPress={this._openOptions} />
                </Appbar.Header>
                {(!this.state.isLoading)? (this.state.studentData)&&<View style={{ flex: 2, overflow: 'hidden' }}>
                    <ScrollView style={{ flex: 3 }} contentContainerStyle={{ paddingBottom: 8 }} refreshControl={<RefreshControl refreshing={this.state.isRefresh} onRefresh={this.loadData} colors={[Theme.colors.accent]} />}>
                        <WelcomeCard namestudent={this.state.studentData.name} />
                        <AssistCard
                            isLoading={this.state.isLoadingAssist}
                            isError={this.state.isErrorAssist}
                            isDisableDetailAssist={this.state.disableButtonDetailAssist}
                            messageError={this.state.messageErrorAssist}
                            assist={this.state.numAssist}
                            notAssist={this.state.numNotAssist}
                            total={this.state.numTotalAssist}
                            reloadAssist={this.loadDataAssist}
                            openDetailsAssit={this._openDetailsAssit}
                        />
                        <SupportCard openDialogPhone={this._support_open_phone} />
                        <Card style={{ marginLeft: 12, marginRight: 12, marginTop: 8 }} elevation={3}>
                            <Card.Title
                                title={'Tarjeta de ingreso'}
                                right={(props)=><IconButton
                                    {...props}
                                    icon={'pencil-ruler'}
                                    color={Theme.colors.accent}
                                    onPress={this._openChangeDesign}
                                />}
                            />
                            <Card.Content>
                                <CustomCredential
                                    scale={this.state.scaleImage}
                                    image={`${urlBase}/image/${decode(this.state.studentData.picture)}`}
                                    name={decode(this.state.studentData.name)}
                                    dni={decode(this.state.studentData.dni)}
                                    style={styles.target}
                                    refTarget={(ref)=>this.refTarget = ref}
                                    type={this.state.designCardElection}
                                    onPress={this.viewImageTarget}
                                />
                            </Card.Content>
                            <Card.Actions style={{ justifyContent: 'flex-end' }}>
                                <Button icon={'cloud-download-outline'} onPress={this.downloadImageTarget}>Descargar</Button>
                                <Button icon={'share-variant-outline'} onPress={this.shareImageTarget}>Compartir</Button>
                            </Card.Actions>
                        </Card>
                        <View style={{ height: 16 }}></View>
                    </ScrollView>
                </View>: (!this.state.isError)?
                <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={'large'} />
                </View>:
                <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} />
                        <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                        <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={this.loadData} style={{ marginTop: 12 }} />
                    </View>
                </View>}
                <CustomSnackbar ref={this.refCustomSnackbar} />
                <Portal>
                    <Dialog visible={this.state.viewLogOut} onDismiss={()=>this.setState({ viewLogOut: false })}>
                        <Dialog.Title>Espere por favor!!!</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Está a punto de cerrar sesión. ¿Estás seguro que quieres realizar esta acción?</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={()=>this.setState({ viewLogOut: false })}>Cancelar</Button>
                            <Button onPress={this.closeSession}>Aceptar</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <Dialog visible={this.state.dialogVisible} onDismiss={()=>this.setState({ dialogVisible: false })}>
                        <Dialog.Title>{this.state.dialogTitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>{this.state.dialogText}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={()=>this.setState({ dialogVisible: false }, this._openOptions)}>Aceptar</Button>
                        </Dialog.Actions>
                    </Dialog>
                    <QueryCall ref={this.refQueryCall} />
                </Portal>

                {/* Modal's */}
                <ChangeCardDesign
                    ref={this.refChangeCardDesign}
                    onChange={this._onChangeCardDesign}
                />
                <ImageViewer ref={this.refImageViewer} />
                <ViewDetailsAssist ref={this.refViewDetailsAssist} />
                <FamilyOptions
                    ref={this.refFamilyOptions}
                    data={this.state.studentData}
                    closeSession={()=>this.setState({ viewLogOut: true })}
                    openImage={this._openImageViewer}
                    openDialog={(title, text)=>this.setState({ dialogVisible: true, dialogTitle: title, dialogText: text })}
                />
                <LoadingComponent ref={this.refLoadingComponent} />
            </PaperProvider>
        </View>);
    }
}

const styles = StyleSheet.create({
    target: {
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 8
    }
});