import React, { Component, PureComponent } from "react";
import { DeviceEventEmitter, Dimensions, EmitterSubscription, PermissionsAndroid, RefreshControl, ScrollView, StyleSheet, ToastAndroid, View, NativeModules } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ActivityIndicator, Appbar, Button, Card, Dialog, IconButton, Paragraph, Portal, ProgressBar, Provider as PaperProvider, Snackbar, Text, Title } from "react-native-paper";
import Theme from "../Themes";
import messaging from '@react-native-firebase/messaging';
import { Family, urlBase } from "../Scripts/ApiTecnica";
import { FamilyDataAssist, StudentsData } from "../Scripts/ApiTecnica/types";
import { decode } from "base-64";
import ViewDetailsAssist from "../Pages/ViewDetailsAssist";
import CustomCredential from "../Components/CustomCredential";
import ViewShot, { captureRef } from "react-native-view-shot";
import ImageView from "react-native-image-viewing";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import ChangeCardDesign from "../Pages/ChangeCardDesign";
import LoadingController from "../Components/loading/loading-controller";
import FamilyOptions from "../Pages/FamilyOptions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainWidget from "../Scripts/MainWidget";

type IProps = {};
type IState = {
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;
    studentData: StudentsData | undefined;
    isLoadingAssist: boolean;
    isErrorAssist: boolean;
    messageErrorAssist: string;
    assistData: FamilyDataAssist[] | undefined;
    numAssist: string;
    numNotAssist: string;
    numTotalAssist: string;
    visibleViewDetailsAssist: boolean;
    scaleImage: number;
    snackBarView: boolean;
    snackBarText: string;
    viewImage: boolean;
    viewImageSource: string;
    showChangeCardDesign: boolean;
    designCardElection: number | undefined;
    showLoading: boolean;
    textLoading: string;
    viewOptions: boolean;
    viewLogOut: boolean;
    disableButtonDetailAssist: boolean;
    dialogVisible: boolean;
    dialogTitle: string;
    dialogText: string;
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
            visibleViewDetailsAssist: false,
            scaleImage: 0.3,
            snackBarView: false,
            snackBarText: '',
            viewImage: false,
            viewImageSource: '',
            showChangeCardDesign: false,
            designCardElection: undefined,
            showLoading: false,
            textLoading: '',
            viewOptions: false,
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
    }
    private event: EmitterSubscription | null = null;
    private refTarget: ViewShot | null | any = null;
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
        this.refTarget = null;
        this.setState({
            studentData: undefined,
            assistData: undefined,
            designCardElection: undefined
        });
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
            .then((uri)=>this.setState({ viewImage: true, viewImageSource: uri }))
            .catch(()=>this.setState({ snackBarView: true, snackBarText: 'Error al generar la imagen.' }));
    }
    async downloadImageTarget() {
        const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
            title: "Atención",
            message: "Para guardar la imagen se necesita acceder al almacenamiento de su dispositivo, por favor acepte los permisos que se requieren.",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar"
        });
        if (permission == PermissionsAndroid.RESULTS.DENIED) return this.setState({ snackBarView: true, snackBarText: 'Se denegó el acceso al almacenamiento.' });
        this.generateImage()
            .then((uri)=>{
                var codeName: number = Math.floor(Math.random() * (99999 - 10000)) + 10000;
                var nameFile: string = `student-${this.state.studentData!.id}`;
                nameFile += `-credential-${codeName}`;
                RNFS.copyFile(uri, `${RNFS.DownloadDirectoryPath}/${nameFile}.png`)
                    .then(()=>this.setState({ snackBarView: true, snackBarText: 'Imagen guardada con éxito' }))
                    .catch(()=>this.setState({ snackBarView: true, snackBarText: 'Error al guardar la imagen' }));
            })
            .catch(()=>this.setState({ snackBarView: true, snackBarText: 'Error al generar la imagen.' }));
    }
    shareImageTarget() {
        this.setState({ showLoading: true, textLoading: 'Espere por favor...' }, ()=>
            this.generateImage('base64')
                .then((base64)=>{
                    var nameFile: string = `student-${this.state.studentData!.id}-credential-${Math.floor(Math.random() * (99999 - 10000)) + 10000}.png`;
                    this.setState({ showLoading: false }, ()=>
                        Share.open({
                            url: `data:image/png;base64,${base64}`,
                            filename: nameFile,
                            type: 'png',
                            showAppsToView: false,
                            isNewTask: true
                        }).catch(()=>this.setState({ snackBarView: true, snackBarText: 'Acción cancelada por el usuario.' }))
                    );
                })
                .catch(()=>this.setState({ showLoading: false, textLoading: '', snackBarView: true, snackBarText: 'Error al generar la imagen.' }))
        );
    }
    /* ###### ########## ###### */
    _openDetailsAssit() {
        if (this.state.assistData!.length == 0) return ToastAndroid.show("No se encontraron registros...", ToastAndroid.SHORT);
        this.setState({ visibleViewDetailsAssist: true });
    }
    closeSession() {
        this.setState({ showLoading: true, textLoading: 'Cerrando sesión...', viewLogOut: false }, async()=>{
            await messaging().unsubscribeFromTopic(`student-${this.state.studentData!.id}`);
            await AsyncStorage.multiRemove(['FamilySession', 'FamilyOptionSuscribe', 'AssistData', 'BackgroundTask']);
            await MainWidget.init();
            DeviceEventEmitter.emit('reVerifySession');
            this.setState({ showLoading: false });
        });
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar.Header>
                    <Appbar.Content title={'TecnicaDigital'} />
                    <Appbar.Action icon={'account-circle-outline'} disabled={this.state.isLoading} onPress={()=>this.setState({ viewOptions: true })} />
                </Appbar.Header>
                {(!this.state.isLoading)? (this.state.studentData)&&<View style={{ flex: 2, overflow: 'hidden' }}>
                    <ScrollView style={{ flex: 3 }} refreshControl={<RefreshControl refreshing={this.state.isRefresh} onRefresh={this.loadData} colors={[Theme.colors.accent]} />}>
                        <Card style={{ marginLeft: 12, marginRight: 12, marginTop: 12 }} elevation={3}>
                            <Card.Content style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Title style={{ width: '95%', overflow: 'hidden' }} numberOfLines={1}><Text style={{ fontWeight: 'bold' }}>Bienvenid@</Text> {decode(this.state.studentData.name)}</Title>
                            </Card.Content>
                        </Card>
                        <Card style={{ marginLeft: 12, marginRight: 12, marginTop: 8, overflow: 'hidden' }} elevation={3}>
                            {(!this.state.isErrorAssist)? <>
                                {(this.state.isLoadingAssist)&&<ProgressBar indeterminate />}
                                <Card.Title
                                    title={'Asistencia:'}
                                    right={(props)=><IconButton
                                        {...props}
                                        icon={'reload'}
                                        disabled={this.state.isLoadingAssist}
                                        onPress={this.loadDataAssist}
                                        color={Theme.colors.accent}
                                    />}
                                />
                                <Card.Content>
                                    <PointItemList title="Presentes" text={this.state.numAssist} />
                                    <PointItemList title="Ausentes" text={this.state.numNotAssist} />
                                    <PointItemList title="Total" text={this.state.numTotalAssist} />
                                </Card.Content>
                                <Card.Actions style={{ justifyContent: 'flex-end' }}>
                                    <Button icon={'account-details'} disabled={this.state.isLoadingAssist || this.state.disableButtonDetailAssist} onPress={this._openDetailsAssit}>Ver detalles</Button>
                                </Card.Actions>
                            </>:
                            <>
                                <Card.Content>
                                    <View style={{ flexDirection: 'column', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
                                        <Icon name={'alert-outline'} size={48} style={{ fontSize: 48 }} />
                                        <Text style={{ marginTop: 10 }}>{this.state.messageErrorAssist}</Text>
                                        <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={this.loadDataAssist} style={{ marginTop: 12 }} />
                                    </View>
                                </Card.Content>
                            </>}
                        </Card>
                        <Card style={{ marginLeft: 12, marginRight: 12, marginTop: 8 }} elevation={3}>
                            <Card.Title
                                title={'Tarjeta de ingreso'}
                                right={(props)=><IconButton
                                    {...props}
                                    icon={'pencil-ruler'}
                                    color={Theme.colors.accent}
                                    onPress={()=>this.setState({ showChangeCardDesign: true })}
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
                <Snackbar
                    visible={this.state.snackBarView}
                    onDismiss={()=>this.setState({ snackBarView: false })}
                    duration={3000}
                    action={{ label: 'OCULTAR', onPress: ()=>this.setState({ snackBarView: false }) }}>
                    <Text>{this.state.snackBarText}</Text>
                </Snackbar>
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
                            <Button onPress={()=>this.setState({ dialogVisible: false, viewOptions: true })}>Aceptar</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <ChangeCardDesign
                    visible={this.state.showChangeCardDesign}
                    close={()=>this.setState({ showChangeCardDesign: false })}
                    onPress={(option)=>this.setState({ designCardElection: option, showChangeCardDesign: false })}
                />
                <ImageView
                    images={(this.state.viewImage)? [{ uri: this.state.viewImageSource }]: []}
                    imageIndex={0}
                    visible={this.state.viewImage}
                    swipeToCloseEnabled={true}
                    doubleTapToZoomEnabled={true}
                    onRequestClose={()=>this.setState({ viewImage: false, viewImageSource: '' })}
                />
                <ViewDetailsAssist
                    visible={this.state.visibleViewDetailsAssist}
                    close={()=>this.setState({ visibleViewDetailsAssist: false })}
                    datas={this.state.assistData as any}
                />
                <FamilyOptions
                    visible={this.state.viewOptions}
                    data={this.state.studentData}
                    close={()=>this.setState({ viewOptions: false })}
                    closeSession={()=>this.setState({ viewLogOut: true, viewOptions: false })}
                    openImage={()=>this.setState({ viewImage: true, viewImageSource: `${urlBase}/image/${decode(this.state.studentData!.picture)}` })}
                    openDialog={(title, text)=>this.setState({ viewOptions: false, dialogVisible: true, dialogTitle: title, dialogText: text })}
                />
                <LoadingController visible={this.state.showLoading} loadingText={this.state.textLoading} indicatorColor={Theme.colors.accent} />
            </PaperProvider>
        </View>);
    }
}

type IProps2 = { title: string; text: string };
class PointItemList extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ marginLeft: 14 }}>⦿</Text>
            <Text style={{ marginLeft: 6, fontWeight: 'bold' }}>{`${this.props.title}:`}</Text>
            <Text style={{ marginLeft: 2 }}>{this.props.text}</Text>
        </View>);
    }
};

const styles = StyleSheet.create({
    target: {
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 8
    }
});