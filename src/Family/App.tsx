import React, { Component, createRef } from "react";
import { DeviceEventEmitter, EmitterSubscription, RefreshControl, ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ActivityIndicator, Appbar, Button, Dialog, IconButton, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Theme from "../Themes";
import messaging from '@react-native-firebase/messaging';
import { Family } from "../Scripts/ApiTecnica";
import { FamilyDataAssist, StudentsData } from "../Scripts/ApiTecnica/types";
import ViewDetailsAssist from "../Pages/ViewDetailsAssist";
import ChangeCardDesign from "../Pages/ChangeCardDesign";
import FamilyOptions from "./Screens/FamilyOptions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainWidget from "../Scripts/MainWidget";
import ImageViewer from "../Pages/ImageViewer";
import LoadingComponent from "../Components/LoadingComponent";
import QueryCall from "./Components/QueryCall";
import WelcomeCard from "./Components/WelcomeCard";
import SupportCard from "./Components/SupportCard";
import AssistCard from "./Components/AssistCard";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import CardCredential from "./Components/CardCredential";
import ScreenTutorial from "./Screens/Tutorial";
import { decode } from "base-64";
import moment from "moment";
import { ThemeContext } from "../Components/ThemeProvider";

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
    designCardElection: number | undefined;
    // Interfaz
    dialogVisible: boolean;
    dialogTitle: string;
    dialogText: string;
    viewLogOut: boolean;
};

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
            designCardElection: undefined,
            viewLogOut: false,
            disableButtonDetailAssist: false,
            dialogVisible: false,
            dialogTitle: '',
            dialogText: ''
        };
        this.loadData = this.loadData.bind(this);
        this.loadDataAssist = this.loadDataAssist.bind(this);
        this.closeSession = this.closeSession.bind(this);
        this._openDetailsAssit = this._openDetailsAssit.bind(this);
        this._openChangeDesign = this._openChangeDesign.bind(this);
        this._openImageViewer = this._openImageViewer.bind(this);
        this._openOptions = this._openOptions.bind(this);
        this._support_open_phone = this._support_open_phone.bind(this);
        this._onChangeCardDesign = this._onChangeCardDesign.bind(this);
        this._openSnackbar = this._openSnackbar.bind(this);
        this._openLoading = this._openLoading.bind(this);
        this.checkWelcomeAndData = this.checkWelcomeAndData.bind(this);
    }
    private event: EmitterSubscription | null = null;
    static contextType = ThemeContext;
    // Refs Components
    private refChangeCardDesign = createRef<ChangeCardDesign>();
    private refImageViewer = createRef<ImageViewer>();
    private refViewDetailsAssist = createRef<ViewDetailsAssist>();
    private refLoadingComponent = createRef<LoadingComponent>();
    private refFamilyOptions = createRef<FamilyOptions>();
    private refQueryCall = createRef<QueryCall>();
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refCardCredential = createRef<CardCredential>();
    private refTutorial = createRef<ScreenTutorial>();

    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
        this.loadData();
    }
    componentWillUnmount() {
        this.event?.remove();
    }
    loadDataAssist() {
        this.checkWelcomeAndData();
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
    checkWelcomeAndData() {
        AsyncStorage.getItem('firts-open').then((firts)=>{
            if (firts == null) {
                this.refTutorial.current?.open();
                return AsyncStorage.setItem('firts-open', '1');
            }
            if (this.refTutorial.current?.state.visible) return;
            AsyncStorage.getItem('show-popover-design').then((verify)=>{
                if (verify == null) {
                    AsyncStorage.setItem('show-popover-design', '1');
                    DeviceEventEmitter.emit('OpenDesignsPopover');
                }
            });
        });
        AsyncStorage.getItem('card-design-election-student').then((election)=>{
            try {
                if (decode(this.state.studentData!.curse).toLowerCase().indexOf('docente') !== -1 || decode(this.state.studentData!.curse).toLowerCase().indexOf('profesor') !== -1) return this.setState({ designCardElection: 4 });
                if (election !== null) this.setState({
                    designCardElection: (election == '0')? undefined: parseInt(election)
                });
            } catch {
                this.setState({ designCardElection: undefined });
            }
        });
    }

    _openDetailsAssit() {
        if (this.state.assistData!.length == 0) return ToastAndroid.show("No se encontraron registros...", ToastAndroid.SHORT);
        this.refViewDetailsAssist.current?.open(this.state.assistData as any);
    }
    closeSession() {
        this.refLoadingComponent.current?.open('Cerrando sesión...');
        this.setState({ viewLogOut: false }, async()=>{
            await messaging().unsubscribeFromTopic(`student-${this.state.studentData!.id}`);
            await AsyncStorage.multiRemove(['FamilySession', 'FamilyOptionSuscribe', 'AssistData', 'card-design-election-student', 'is-now-visible-banner-family']);
            if (__DEV__) await AsyncStorage.multiRemove(['firts-open', 'show-popover-design']);
            await MainWidget.init();
            this.refLoadingComponent.current?.close();
            DeviceEventEmitter.emit('reVerifySession');
        });
    }

    // New's
    _openChangeDesign() {
        const isVip = (decode(this.state.studentData!.curse).indexOf('7°') !== -1) && (moment().format("YYYY") == "2022");
        this.refChangeCardDesign.current?.open(isVip);
    }
    _openImageViewer(src: string) {
        this.refImageViewer.current?.open(src);
    }
    _openOptions() {
        this.refFamilyOptions.current?.open();
    }
    _onChangeCardDesign(option: number | undefined) {
        this.setState({ designCardElection: option });
        AsyncStorage.setItem('card-design-election-student', (option !== undefined)? option.toString(): '0');
    }
    _openSnackbar(text: string) {
        this.refCustomSnackbar.current?.open(text);
    }
    _openLoading(visible: boolean, text?: string) {
        if (visible) this.refLoadingComponent.current?.open(text!);
        this.refLoadingComponent.current?.close();
    }

    // Support
    _support_open_phone() {
        this.refQueryCall.current?.open();
    }

    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View style={{ flex: 1 }}>
            <Appbar.Header>
                <Appbar.Content title={'TecnicaDigital'} />
                <Appbar.Action icon={'account-circle-outline'} disabled={this.state.isLoading} onPress={this._openOptions} />
            </Appbar.Header>
            {(!this.state.isLoading)? (this.state.studentData)&&<View style={{ flex: 2, overflow: 'hidden' }}>
                <ScrollView style={{ flex: 3 }} contentContainerStyle={{ paddingBottom: 8 }} refreshControl={<RefreshControl refreshing={this.state.isRefresh} onRefresh={this.loadData} colors={[Theme.colors.primary]} progressBackgroundColor={theme.colors.surface} />}>
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
                    <CardCredential
                        ref={this.refCardCredential}
                        studentData={this.state.studentData}
                        designCardElection={this.state.designCardElection}
                        openChangeDesign={this._openChangeDesign}
                        openImageViewer={this._openImageViewer}
                        showSnackbar={this._openSnackbar}
                        showLoading={this._openLoading}
                    />
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
            <ScreenTutorial ref={this.refTutorial} onClose={this.checkWelcomeAndData} />
            <ChangeCardDesign
                ref={this.refChangeCardDesign}
                onChange={this._onChangeCardDesign}
                isFamily={true}
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