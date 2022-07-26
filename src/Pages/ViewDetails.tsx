import { decode } from "base-64";
import moment from "moment";
import React, { Component, PureComponent } from "react";
import { Dimensions, Linking, PermissionsAndroid, ScrollView, StyleSheet, ToastAndroid, TouchableHighlight, View } from "react-native";
import { Appbar, Button, Card, IconButton, ProgressBar, Provider as PaperProvider, Snackbar, Text } from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import CustomCredential from "../Components/CustomCredential";
import CustomModal from "../Components/CustomModal";
import { Assist, urlBase } from "../Scripts/ApiTecnica";
import { AssistIndividualData, StudentsData } from "../Scripts/ApiTecnica/types";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import Theme from "../Themes";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";

type IProps = {
    visible: boolean;
    data: StudentsData | undefined;
    designCard: number | undefined;
    close: ()=>any;
    openImage: (data: { uri: string })=>any;
    openDetailsAssist: (data: AssistIndividualData[])=>any;
    changeDesign: ()=>any;
    goLoading: (v: boolean, t: string, a?: ()=>any)=>any;
};
type IState = {
    snackBarView: boolean;
    snackBarText: string;

    scaleImage: number;

    // Extra Data
    idStudent: string;
    // Assist
    isLoadAssist: boolean;
    existAssist: boolean;
    dataAssist: AssistIndividualData[];
    numAssist: string;
    numNotAssist: string;
};

const { width } = Dimensions.get('window');

export default class ViewDetails extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            snackBarView: false,
            snackBarText: '',
            scaleImage: 0.3,
            idStudent: '',
            isLoadAssist: false,
            existAssist: false,
            dataAssist: [],
            numAssist: 'Cargando...',
            numNotAssist: 'Cargando...'
        };
        this.loadAssist = this.loadAssist.bind(this);
        this.openListStudent = this.openListStudent.bind(this);
        this.viewImageTarget = this.viewImageTarget.bind(this);
        this.downloadImageTarget = this.downloadImageTarget.bind(this);
        this.shareImageTarget = this.shareImageTarget.bind(this);
        this.closeAndClear = this.closeAndClear.bind(this);
    }
    private refTarget: ViewShot | null | any = null;
    componentDidMount() {
        var scales: number[] = [];
        for (let i = 1; i > 0; i -= 0.001) { scales.push(i); }
        var scaleUse: number = 0;
        scales.forEach((val)=>(((1200 * val) < (width - 48)) && scaleUse == 0) && (scaleUse = val));
        this.setState({ scaleImage: scaleUse });
    }
    calcYears(date: string): string {
        var dateNow = new Date();
        var processDate = moment(date, 'DD-MM-YYYY').toDate();
        var years = dateNow.getFullYear() - processDate.getFullYear();
        var months = dateNow.getMonth() - processDate.getMonth();
        if (months < 0 || (months === 0 && dateNow.getDate() < processDate.getDate())) years--;
        return String(years);
    }
    generateImage(result?: "tmpfile" | "base64" | "data-uri" | "zip-base64" | undefined): Promise<string> {
        return new Promise((resolve, reject)=>{
            captureRef(this.refTarget, { quality: 1, format: 'png', result: (result)? result: 'tmpfile' })
                .then((uri)=>resolve(uri))
                .catch(()=>reject());
        });
    }
    viewImageTarget() {
        this.generateImage()
            .then((uri)=>this.props.openImage({ uri }))
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
        await this.verifyFolder();
        this.generateImage()
            .then((uri)=>{
                var codeName: number = Math.floor(Math.random() * (99999 - 10000)) + 10000;
                var nameFile: string = (this.props.data)? `student-${this.props.data.id}`: '';
                nameFile += `-credential-${codeName}`;
                RNFS.copyFile(uri, `${RNFS.DownloadDirectoryPath}/tecnica-digital/${(this.props.data)? decode(this.props.data.curse): ''}/${nameFile}.png`)
                    .then(()=>this.setState({ snackBarView: true, snackBarText: 'Imagen guardada con éxito' }))
                    .catch((e)=>this.setState({ snackBarView: true, snackBarText: 'Error al guardar la imagen' }));
            })
            .catch(()=>this.setState({ snackBarView: true, snackBarText: 'Error al generar la imagen.' }));
    }
    shareImageTarget() {
        this.props.goLoading(true, 'Espere por favor...', ()=>
            this.generateImage('base64')
                .then((base64)=>{
                    var nameFile: string = `student-${this.props.data!.id}-credential-${Math.floor(Math.random() * (99999 - 10000)) + 10000}.png`;
                    this.props.goLoading(false, 'Espere por favor...', ()=>
                        Share.open({
                            url: `data:image/png;base64,${base64}`,
                            filename: nameFile,
                            type: 'png',
                            showAppsToView: false,
                            isNewTask: true
                        }).catch(()=>this.props.goLoading(false, 'Espere por favor...', ()=>this.setState({ snackBarView: true, snackBarText: 'Acción cancelada por el usuario.' })))
                    );
                })
                .catch(()=>this.props.goLoading(false, 'Espere por favor...', ()=>this.setState({ snackBarView: true, snackBarText: 'Error al generar la imagen.' })))
        );
    }
    async verifyFolder() {
        if (this.props.data) {
            if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`)) RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`);
            if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/${decode(this.props.data.curse)}/`)) RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/${decode(this.props.data.curse)}/`);
        }
    }
    loadAssist() {
        var id = '';
        for (let i = 0; i < 5 - this.props.data!.id.length; i++) { id += '0'; }
        this.setState({ isLoadAssist: true, idStudent: `#${id}${this.props.data!.id}` }, ()=>
            Assist.getIndividual(this.props.data?.id!)
                .then((data)=>{
                    var assists: number = 0;
                    var notAssists: number = 0;
                    data.forEach((v)=>(v.status)? assists += 1: notAssists += 1);
                    this.setState({
                        isLoadAssist: false,
                        existAssist: true,
                        dataAssist: data,
                        numAssist: assists.toString(),
                        numNotAssist: notAssists.toString()
                    });
                })
                .catch((err)=>this.setState({
                    isLoadAssist: false,
                    snackBarView: true,
                    snackBarText: err.cause
                }))
        );
    }
    openListStudent() {
        if (this.state.dataAssist.length !== 0) return this.props.openDetailsAssist(this.state.dataAssist);;
        this.setState({ snackBarView: true, snackBarText: 'La lista de asistencia está vacía.' });
    }
    closeAndClear() {
        if (this.state.isLoadAssist) return ToastAndroid.show('No se puede cerrar esta ventana en este momento.', ToastAndroid.SHORT);
        this.setState({
            snackBarView: false,
            snackBarText: '',
            isLoadAssist: false,
            dataAssist: [],
            numAssist: 'Cargando...',
            numNotAssist: 'Cargando...'
        });
        this.refTarget = null;
        this.props.close();
    }
    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onShow={this.loadAssist} onRequestClose={this.closeAndClear}>
            <PaperProvider theme={Theme}>
                {(this.props.data)&&<View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.closeAndClear} />
                        <Appbar.Content title={'Ver más detalles'}  />
                    </Appbar.Header>
                    <ScrollView style={{ flex: 2 }}>
                        <View style={{ margin: 20, height: 100, width: (width - 40), flexDirection: 'row' }}>
                            <TouchableHighlight style={styles.imageProfile} onPress={()=>this.props.openImage({ uri: `${urlBase}/image/${(this.props.data)? decode(this.props.data.picture): ''}` })}>
                                <ImageLazyLoad style={{ width: '100%', height: '100%' }} source={{ uri: `${urlBase}/image/${decode(this.props.data.picture)}` }} circle={true} />
                            </TouchableHighlight>
                            <View style={styles.textProfile}>
                                <Text numberOfLines={2} style={{ fontSize: 20 }}>{decode(this.props.data.name)}</Text>
                                <Text style={{ marginTop: 8, marginLeft: 12, color: 'rgba(0, 0, 0, 0.7)' }}>
                                    <Text style={{ fontWeight: 'bold', color: '#000000' }}>Curso: </Text>
                                    {decode(this.props.data.curse)}
                                </Text>
                            </View>
                        </View>
                        <Card style={{ marginLeft: 8, marginRight: 8, marginBottom: 12 }} elevation={3}>
                            <Card.Title title={'información:'} />
                            <Card.Content>
                                <PointItemList title="ID" data={this.state.idStudent} />
                                <PointItemList title="Fecha de nacimiento" data={decode(this.props.data.date)} />
                                <PointItemList title="Edad" data={`${this.calcYears(decode(this.props.data.date))} años`} />
                                <PointItemList title="D.N.I" data={decode(this.props.data.dni)} />
                            </Card.Content>
                        </Card>
                        <Card style={{ marginLeft: 8, marginRight: 8, marginBottom: 12, overflow: 'hidden' }} elevation={3}>
                            {(this.state.isLoadAssist)&&<ProgressBar indeterminate />}
                            <Card.Title
                                title={'Asistencia:'}
                                right={(props)=><IconButton
                                    {...props}
                                    icon={'reload'}
                                    color={Theme.colors.accent}
                                    onPress={this.loadAssist}
                                />}
                            />
                            <Card.Content>
                                <PointItemList title="Presentes" data={this.state.numAssist} />
                                <PointItemList title="Aunsentes" data={this.state.numNotAssist} />
                            </Card.Content>
                            <Card.Actions style={{ justifyContent: 'flex-end' }}>
                                <Button disabled={this.state.isLoadAssist || !this.state.existAssist} icon={'account-details'} onPress={this.openListStudent}>Ver detalles</Button>
                            </Card.Actions>
                        </Card>
                        <Card style={{ marginLeft: 8, marginRight: 8, marginBottom: 12 }} elevation={3}>
                            <Card.Title title={'Medios de contacto:'} />
                            <Card.Content>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                                    <IconButton disabled={this.state.isLoadAssist} color="#15b2f7" animated icon={'phone'} style={styles.buttonsContacts} onPress={()=>Linking.openURL(`tel:+549${(this.props.data)? decode(this.props.data.tel): ''}`)}/>
                                    <IconButton disabled={this.state.isLoadAssist} color="#eb5c23" animated icon={'message'} style={styles.buttonsContacts} onPress={()=>Linking.openURL(`sms:+549${(this.props.data)? decode(this.props.data.tel): ''}`)}/>
                                    <IconButton disabled={this.state.isLoadAssist} color="#25D366" animated icon={'whatsapp'} style={styles.buttonsContacts} onPress={()=>Linking.openURL(`whatsapp://send?phone=+549${(this.props.data)? decode(this.props.data.tel): ''}`)}/>
                                    {(this.props.data.email.length !== 0)&&<IconButton disabled={this.state.isLoadAssist} color="#ffce00" animated icon={'email'} style={styles.buttonsContacts} onPress={()=>Linking.openURL(`mailto:${(this.props.data)? decode(this.props.data.email): ''}`)}/>}
                                </View>
                            </Card.Content>
                        </Card>
                        <Card style={{ marginLeft: 8, marginRight: 8, marginBottom: 12 }} elevation={3}>
                            <Card.Title
                                title={'Tarjeta de ingreso'}
                                right={(props)=><IconButton
                                    {...props}
                                    disabled={this.state.isLoadAssist}
                                    icon={'pencil-ruler'}
                                    color={Theme.colors.accent}
                                    onPress={()=>this.props.changeDesign()}
                                />}
                            />
                            <Card.Content>
                                <CustomCredential
                                    scale={this.state.scaleImage}
                                    image={`${urlBase}/image/${decode(this.props.data.picture)}`}
                                    name={decode(this.props.data.name)}
                                    dni={decode(this.props.data.dni)}
                                    refTarget={(ref)=>this.refTarget = ref}
                                    onPress={this.viewImageTarget}
                                    style={styles.target}
                                    type={this.props.designCard}
                                />
                            </Card.Content>
                            <Card.Actions style={{ justifyContent: 'flex-end' }}>
                                <Button icon={'cloud-download-outline'} onPress={this.downloadImageTarget}>Dercargar</Button>
                                <Button icon={'share-variant-outline'} onPress={this.shareImageTarget}>Compartir</Button>
                            </Card.Actions>
                        </Card>
                    </ScrollView>
                </View>}
                <Snackbar
                    visible={this.state.snackBarView}
                    onDismiss={()=>this.setState({ snackBarView: false })}
                    duration={3000}
                    action={{ label: 'OCULTAR', onPress: ()=>this.setState({ snackBarView: false }) }}>
                    <Text>{this.state.snackBarText}</Text>
                </Snackbar>
            </PaperProvider>
        </CustomModal>);
    }
}

type IProps2 = { title: string; data: string };
class PointItemList extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<Text style={{ marginTop: 8, marginLeft: 32, flexDirection: 'row', alignItems: 'center' }}>
            <Text>{'\u2B24'}    </Text>
            <Text style={{ fontWeight: 'bold' }}>{this.props.title}: </Text>
            <Text>{this.props.data}</Text>
        </Text>);
    }
};

const styles = StyleSheet.create({
    imageProfile: {
        borderRadius: 100,
        height: 90,
        width: 90,
        margin: 5,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    textProfile: {
        flex: 3,
        paddingLeft: 16,
        paddingTop: 18
    },
    buttonsContacts: {
        marginLeft: 12,
        marginRight: 12
    },
    target: {
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 8
    }
});