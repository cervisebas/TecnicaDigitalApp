import React, { Component, PureComponent } from "react";
import { DeviceEventEmitter, Dimensions, EmitterSubscription, PermissionsAndroid, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ActivityIndicator, Appbar, Button, Card, IconButton, ProgressBar, Provider as PaperProvider, Snackbar, Text, Title } from "react-native-paper";
import Theme from "../Themes";
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
            textLoading: ''
        };
        this.loadData = this.loadData.bind(this);
        this.loadDataAssist = this.loadDataAssist.bind(this);
        this.viewImageTarget = this.viewImageTarget.bind(this);
        this.downloadImageTarget = this.downloadImageTarget.bind(this);
        this.shareImageTarget = this.shareImageTarget.bind(this);
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
        this.setState({
            studentData: undefined,
            assistData: undefined,
            designCardElection: undefined
        });
    }
    loadDataAssist() {
        this.setState({ isLoadingAssist: true, isErrorAssist: false, numAssist: 'Cargando...', numNotAssist: 'Cargando...', numTotalAssist: 'Cargando...' }, ()=>
            Family.getDataAssistStudent()
                .then((data)=>{
                    var assists: number = 0;
                    var notAssists: number = 0;
                    data.forEach((v)=>(v.status)? assists += 1: notAssists += 1);
                    this.setState({ isLoadingAssist: false, assistData: data, numAssist: assists.toString(), numNotAssist: notAssists.toString(), numTotalAssist: data.length.toString() });
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

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar.Header>
                    <Appbar.Content
                        title={'TecnicaDigital'} />
                    <Appbar.Action icon={'account-circle-outline'} />
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
                                    <PointItemList title="Aunsentes" text={this.state.numNotAssist} />
                                    <PointItemList title="Total" text={this.state.numTotalAssist} />
                                </Card.Content>
                                <Card.Actions style={{ justifyContent: 'flex-end' }}>
                                    <Button icon={'account-details'} disabled={this.state.isLoadingAssist} onPress={()=>this.setState({ visibleViewDetailsAssist: true })}>Ver detalles</Button>
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
                                <Button icon={'cloud-download-outline'} onPress={this.downloadImageTarget}>Dercargar</Button>
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