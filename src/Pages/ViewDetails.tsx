import { decode, encode } from "base-64";
import moment from "moment";
import React, { Component, createRef, PureComponent } from "react";
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
import CardCredential from "../Components/Elements/CardCredential";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";

type IProps = {
    openImage: (data: { uri: string })=>any;
    openDetailsAssist: (data: AssistIndividualData[])=>any;
    changeDesign: (isVip?: boolean)=>any;
    goLoading: (v: boolean, t?: string, a?: ()=>any)=>any;
    editNow: (data: StudentsData)=>any;
};
type IState = {
    visible: boolean;
    data: StudentsData;
    designCard: number | undefined;
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
            visible: false,
            data: this.defaultData,
            designCard: undefined,
            idStudent: '',
            isLoadAssist: false,
            existAssist: false,
            dataAssist: [],
            numAssist: 'Cargando...',
            numNotAssist: 'Cargando...'
        };
        this.loadAssist = this.loadAssist.bind(this);
        this.openListStudent = this.openListStudent.bind(this);
        this.closeAndClear = this.closeAndClear.bind(this);
        this.editNow = this.editNow.bind(this);
        this.openChangeDesign = this.openChangeDesign.bind(this);
        this._showSnackbar = this._showSnackbar.bind(this);
    }
    private defaultData: StudentsData = {
        id: '-1',
        name: encode('none'),
        dni: encode('none'),
        curse: encode('none'),
        tel: encode('none'),
        email: encode('none'),
        date: encode('none'),
        picture: encode('default.png')
    };
    private refCustomSnackbar = createRef<CustomSnackbar>();
    calcYears(date: string): string {
        var dateNow = new Date();
        var processDate = moment(date, 'DD-MM-YYYY').toDate();
        var years = dateNow.getFullYear() - processDate.getFullYear();
        var months = dateNow.getMonth() - processDate.getMonth();
        if (months < 0 || (months === 0 && dateNow.getDate() < processDate.getDate())) years--;
        return String(years);
    }
    loadAssist() {
        var id = '';
        for (let i = 0; i < 5 - this.state.data!.id.length; i++) { id += '0'; }
        this.setState({ isLoadAssist: true, idStudent: `#${id}${this.state.data!.id}` }, ()=>
            Assist.getIndividual(this.state.data?.id!)
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
                .catch((err)=>{
                    this.setState({ isLoadAssist: false });
                    this.refCustomSnackbar.current?.open(err.cause);
                })
        );
    }
    openListStudent() {
        if (this.state.dataAssist.length !== 0) return this.props.openDetailsAssist(this.state.dataAssist);
        this.refCustomSnackbar.current?.open('La lista de asistencia está vacía.');
    }
    closeAndClear() {
        if (this.state.isLoadAssist) return ToastAndroid.show('No se puede cerrar esta ventana en este momento.', ToastAndroid.SHORT);
        this.setState({
            isLoadAssist: false,
            dataAssist: [],
            numAssist: 'Cargando...',
            numNotAssist: 'Cargando...'
        });
        this.refCustomSnackbar.current?.close();
        this.close();
    }
    editNow() {
        if (this.state.isLoadAssist) return ToastAndroid.show('No se puede editar el estudiante en este momento.', ToastAndroid.SHORT);
        this.closeAndClear();
        this.props.editNow(this.state.data);
    }
    openChangeDesign() {
        const isVip = (decode(this.state.data.curse).indexOf("7°") !== -1) && (moment().format("YYYY") == "2022");
        this.props.changeDesign(isVip);
    }
    _showSnackbar(text: string) {
        this.refCustomSnackbar.current?.open(text);
    }

    // Controller
    open(data: StudentsData, designCard: number | undefined) {
        this.setState({
            visible: true,
            data,
            designCard
        });
    }
    close() {
        this.setState({
            visible: false,
            data: this.defaultData,
            designCard: undefined
        });
    }
    updateCardDesign(designCard: number | undefined) {
        this.setState({ designCard });
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onShow={this.loadAssist} onRequestClose={this.closeAndClear}>
            <PaperProvider theme={Theme}>
                <View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.closeAndClear} />
                        <Appbar.Content title={'Ver más detalles'} />
                        <Appbar.Action icon={'account-edit-outline'} onPress={this.editNow} />
                    </Appbar.Header>
                    <ScrollView style={{ flex: 2 }}>
                        <View style={{ margin: 20, height: 100, width: (width - 40), flexDirection: 'row' }}>
                            <TouchableHighlight style={styles.imageProfile} onPress={()=>this.props.openImage({ uri: `${urlBase}/image/${(this.state.data)? decode(this.state.data.picture): ''}` })}>
                                <ImageLazyLoad style={{ width: '100%', height: '100%' }} source={{ uri: `${urlBase}/image/${decode(this.state.data.picture)}` }} circle={true} />
                            </TouchableHighlight>
                            <View style={styles.textProfile}>
                                <Text numberOfLines={2} style={{ fontSize: 20 }}>{decode(this.state.data.name)}</Text>
                                <Text style={{ marginTop: 8, marginLeft: 12, color: 'rgba(0, 0, 0, 0.7)' }}>
                                    <Text style={{ fontWeight: 'bold', color: '#000000' }}>Curso: </Text>
                                    {decode(this.state.data.curse)}
                                </Text>
                            </View>
                        </View>
                        <Card style={{ marginLeft: 8, marginRight: 8, marginBottom: 12 }} elevation={3}>
                            <Card.Title title={'Información:'} />
                            <Card.Content>
                                <PointItemList title="ID" data={this.state.idStudent} />
                                <PointItemList title="Fecha de nacimiento" data={decode(this.state.data.date)} />
                                <PointItemList title="Edad" data={`${this.calcYears(decode(this.state.data.date))} años`} />
                                <PointItemList title="D.N.I" data={decode(this.state.data.dni)} />
                            </Card.Content>
                        </Card>
                        <Card style={{ marginLeft: 8, marginRight: 8, marginBottom: 12, overflow: 'hidden' }} elevation={3}>
                            <ProgressBar indeterminate={true} style={{ display: (this.state.isLoadAssist)? 'flex': 'none' }} />
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
                                <PointItemList title="Ausentes" data={this.state.numNotAssist} />
                            </Card.Content>
                            <Card.Actions style={{ justifyContent: 'flex-end' }}>
                                <Button disabled={this.state.isLoadAssist || !this.state.existAssist} icon={'account-details'} onPress={this.openListStudent}>Ver detalles</Button>
                            </Card.Actions>
                        </Card>
                        <Card style={{ marginLeft: 8, marginRight: 8, marginBottom: 12 }} elevation={3}>
                            <Card.Title title={'Medios de contacto:'} />
                            <Card.Content>
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
                                    <IconButton disabled={this.state.isLoadAssist} color="#15b2f7" animated icon={'phone'} style={styles.buttonsContacts} onPress={()=>Linking.openURL(`tel:+549${(this.state.data)? decode(this.state.data.tel): ''}`)}/>
                                    <IconButton disabled={this.state.isLoadAssist} color="#eb5c23" animated icon={'message'} style={styles.buttonsContacts} onPress={()=>Linking.openURL(`sms:+549${(this.state.data)? decode(this.state.data.tel): ''}`)}/>
                                    <IconButton disabled={this.state.isLoadAssist} color="#25D366" animated icon={'whatsapp'} style={styles.buttonsContacts} onPress={()=>Linking.openURL(`whatsapp://send?phone=+549${(this.state.data)? decode(this.state.data.tel): ''}`)}/>
                                    {(this.state.data.email.length !== 0)&&<IconButton disabled={this.state.isLoadAssist} color="#ffce00" animated icon={'email'} style={styles.buttonsContacts} onPress={()=>Linking.openURL(`mailto:${(this.state.data)? decode(this.state.data.email): ''}`)}/>}
                                </View>
                            </Card.Content>
                        </Card>
                        <CardCredential
                            studentData={this.state.data}
                            designCardElection={this.state.designCard}
                            openChangeDesign={this.openChangeDesign}
                            openImageViewer={this.props.openImage}
                            showLoading={this.props.goLoading}
                            showSnackbar={this._showSnackbar}
                        />
                    </ScrollView>
                </View>
                <CustomSnackbar ref={this.refCustomSnackbar} />
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