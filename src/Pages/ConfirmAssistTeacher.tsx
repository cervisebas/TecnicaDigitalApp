import { decode, encode } from "base-64";
import moment from "moment";
import React, { Component, createRef, PureComponent, ReactNode } from "react";
import { DeviceEventEmitter, FlatList, ListRenderItemInfo, PermissionsAndroid, ToastAndroid, View } from "react-native";
import { Appbar, Button, Dialog, Divider, Menu, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomModal from "../Components/CustomModal";
import CustomNoInvasiveLoading from "../Components/CustomNoInvasiveLoading";
import ItemAssitTeacher from "../Components/Elements/CustomItem3";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import { ThemeContext } from "../Components/ThemeProvider";
import { Assist } from "../Scripts/ApiTecnica";
import { AssistUserData, DataList } from "../Scripts/ApiTecnica/types";
import CreatePDFTeachers from "../Scripts/CreatePDFTeachers";
import { waitTo } from "../Scripts/Utils";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";

type IProps = {
    showLoading: (v: boolean, t?: string)=>any;
    showSnackbar: (v: boolean, t: string)=>any;
    openImage: (source: string, text: string)=>any;
};
type IState = {
    visible: boolean;
    select: string;
    otherData: {
        turn: string;
        date: string;
    };
    setData: AssistUserData[];

    isMenuOpen: boolean;
    isLoading: boolean;

    data: AssistUserData[];
    dataBackup: AssistUserData[];
    dataLog: DataList[];
};

export default class ConfirmAssistTeacher extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            select: '',
            otherData: {
                turn: '',
                date: ''
            },
            setData: [],
            isMenuOpen: false,
            isLoading: false,
            data: [],
            dataBackup: [],
            dataLog: []
        };
        this.closeAndClean = this.closeAndClean.bind(this);
        this.loadData = this.loadData.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._openDelete = this._openDelete.bind(this);
        this._deleteRowNow = this._deleteRowNow.bind(this);
        this.delete = this.delete.bind(this);
        this.createPDF = this.createPDF.bind(this);
    }
    static contextType = ThemeContext;
    private idDeleteRow: string = '-1';
    private numProcess: number = 0;
    // Ref's
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refCustomNoInvasiveLoading = createRef<CustomNoInvasiveLoading>();
    private refComponentDialogs = createRef<ComponentDialogs>();

    loadData() {
        this.setState({
            data: this.state.setData,
            dataBackup: this.state.setData,
            dataLog: this.state.setData.map((s)=>({
                check: (s.existRow)? s.status: false,
                idStudent: s.id,
                idAssist: s.idAssist,
                exist: s.exist
            }))
        });
    }
    closeAndClean() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.setState({ dataLog: [], data: [] });
        this.close();
    }
    delete() {
        this.props.showLoading(true, 'Eliminando registro...');
        Assist.deleteAssist(this.state.select)
            .then(()=>{
                this.props.showLoading(false);
                DeviceEventEmitter.emit('p7-reload', true);
                this.props.showSnackbar(true, `Se elimino el registro #"${this.state.select}".`);
                this.closeAndClean();
            })
            .catch((error)=>{
                this.props.showLoading(false, 'Eliminando registro...');
                this.refComponentDialogs.current?.setState({ alertVisible: true, alertMessage: error.cause });
            });
    }

    // Flatlist
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    _keyExtractor({ id }: AssistUserData) {
        return `confirm-assist-${id}`;
    }
    _renderItem({ item, index }: ListRenderItemInfo<AssistUserData>) {
        return(<ItemAssitTeacher
            item={item}
            //status={(item.exist)? (item.status)? 'checked': 'unchecked': 'unchecked'}
            status={(this.state.dataLog[index].check)? 'checked': 'unchecked'}
            isLoading={this.state.isLoading}
            onPressImage={this.props.openImage}
            onPress={(state, finish)=>this._updateRowNow(item.id, state, finish)}
            onPressAdd={(finish)=>this._addRowNow(item.id, finish)}
            onPressRemove={()=>this._onDeleteRow(item.id)}
        />);
    }
    _getItemLayout(_data: AssistUserData[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * index,
            index
        };
    }

    // Controller
    open(id: string, date: string, turn: string, setData: AssistUserData[]) {
        this.setState({
            visible: true,
            select: id,
            setData,
            otherData: {
                date,
                turn
            }
        });
    }
    close() {
        this.setState({
            visible: false,
            select: '',
            setData: [],
            dataLog: []
        });
    }

    // News
    _openDelete() {
        this.refComponentDialogs.current?.setState({ deleteVisible: true });
    }
    calculeDates(thisDate: string) {
        try {
            const _this = moment(thisDate, 'DD/MM/YYYY').toDate();
            const _actual = moment().toDate();
            const difference = _this.getTime() - _actual.getTime();
            var TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
            if (TotalDays < 0) TotalDays *= -1;
            return !(TotalDays >= 2);
        } catch {
            return false;
        }
    }
    _goNoInvasiveLoading(visible: boolean, message?: string) {
        if (!visible) return this.refCustomNoInvasiveLoading.current?.close();
        if (this.refCustomNoInvasiveLoading.current?.isOpen()) return this.refCustomNoInvasiveLoading.current.update(message!);
        this.refCustomNoInvasiveLoading.current?.open(message!);
    }
    async createPDF() {
        try {
            this.props.showLoading(true, 'Generando PDF...');
            const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
                title: "Atención",
                message: "Para guardar la imagen se necesita acceder al almacenamiento de su dispositivo, por favor acepte los permisos que se requieren.",
                buttonNegative: "Cancelar",
                buttonPositive: "Aceptar"
            });
            if (permission == PermissionsAndroid.RESULTS.DENIED) {
                this.props.showLoading(false);
                return this.refCustomSnackbar.current?.open('Se denegó el acceso al almacenamiento.');
            }
            const useTeachers = this.state.data.filter((v)=>v.existRow);            
            const path = await CreatePDFTeachers.generatePdf({
                id: this.state.select,
                date: decode(this.state.otherData.date),
                turn: this.state.otherData.turn,
                teachers: useTeachers
            });
            RNFS.copyFile(path, `${RNFS.DownloadDirectoryPath}/horario-docente-${this.state.select}.pdf`)
                .then(()=>ToastAndroid.show('El archivo se copio correctamente en la carpeta de descargas', ToastAndroid.SHORT))
                .catch(()=>ToastAndroid.show('Ocurrió un error al copiar el archivo a la carpeta de descargas', ToastAndroid.SHORT));
            FileViewer.open(path, { showOpenWithDialog: true, showAppsSuggestions: true })
                .catch(()=>this.refCustomSnackbar.current?.open('Ocurrió un problema al abrir el archivo generado.'));
            this.props.showLoading(false);
        } catch {
            this.props.showLoading(false);
            this.refCustomSnackbar.current?.open('Ocurrió un error inesperado durante el proceso.');
        }
    }

    // Row's Functions
    _onDeleteRow(idAssist: string) {
        this.idDeleteRow = idAssist;
        this.refComponentDialogs.current?.setState({ deleteRowAssist: true });
    }
    _deleteRowNow() {
        this.props.showLoading(true, 'Removiendo docente....');
        Assist.removeTeacherAssist(this.state.select, this.idDeleteRow)
            .then(()=>{
                this.props.showLoading(true, 'Regenerando registro...');
                const dataLog = this.state.dataLog.map((elm)=>{
                    if (elm.idStudent == this.idDeleteRow) return { ...elm, exist: false, check: false };
                    return elm;
                });
                const data = this.state.data.map((elm)=>{
                    if (elm.id == this.idDeleteRow) return { ...elm, idAssist: '-1', status: false, existRow: false };
                    return elm;
                });
                this.setState({ dataLog, data }, ()=>{
                    this.props.showLoading(false);
                    this.refCustomSnackbar.current?.open('El docente fue retirado del registro de forma exitosa.');
                });
            })
            .catch((error)=>{
                this.props.showLoading(false);
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }
    _addRowNow(idTeacher: string, finish?: ()=>void) {
        this.numProcess += 1;
        if (this.numProcess == 1) this._goNoInvasiveLoading(true, 'Añadiendo docente....'); else this._goNoInvasiveLoading(true, `Ejecutando ${this.numProcess} procesos...`);
        Assist.addTeacherAssist(this.state.select, idTeacher)
            .then((newId)=>{
                this.numProcess -= 1;
                if (this.numProcess == 0) this._goNoInvasiveLoading(true, 'Regenerando registro...'); else this._goNoInvasiveLoading(true, (this.numProcess == 1)? 'Ejecutando 1 proceso...': `Ejecutando ${this.numProcess} procesos...`);
                const dataLog = this.state.dataLog.map((elm)=>{
                    if (elm.idStudent == idTeacher) return { ...elm, exist: true };
                    return elm;
                });
                const data = this.state.data.map((elm)=>{
                    if (elm.id == idTeacher) return { ...elm, idAssist: newId, existRow: true, time: encode(moment().format('HH:mm')) };
                    return elm;
                });
                this.setState({ dataLog, data }, async()=>{
                    if (this.numProcess == 0) {
                        await waitTo(500);
                        if (this.numProcess == 0) this._goNoInvasiveLoading(false);
                    }
                    (finish)&&finish();
                    //this.refCustomSnackbar.current?.open('El docente fue añadido al registro de forma exitosa.');
                });
            })
            .catch((error)=>{
                this.numProcess -= 1;
                this._goNoInvasiveLoading(false);
                this.refCustomSnackbar.current?.open(error.cause);
                (finish)&&finish();
            }); 
    }
    _updateRowNow(idTeacher: string, state: boolean, finish?: ()=>void) {
        this.numProcess += 1;
        if (this.numProcess == 1) this._goNoInvasiveLoading(true, `Aplicando estado "${(state)? 'presente': 'ausente'}"...`); else this._goNoInvasiveLoading(true, `Ejecutando ${this.numProcess} procesos...`);
        Assist.modifyTeacherAssist(this.state.select, idTeacher, state)
            .then(()=>{
                this.numProcess -= 1;
                if (this.numProcess == 0) this._goNoInvasiveLoading(true, 'Regenerando registro...'); else this._goNoInvasiveLoading(true, (this.numProcess == 1)? 'Ejecutando 1 proceso...': `Ejecutando ${this.numProcess} procesos...`);
                const dataLog = this.state.dataLog.map((elm)=>{
                    if (elm.idStudent == idTeacher) return { ...elm, check: state };
                    return elm;
                });
                const data = this.state.data.map((elm)=>{
                    if (elm.id == idTeacher) return { ...elm, status: state, time: encode(moment().format('HH:mm')) };
                    return elm;
                });
                this.setState({ dataLog, data }, async()=>{
                    if (this.numProcess == 0) {
                        await waitTo(500);
                        if (this.numProcess == 0) this._goNoInvasiveLoading(false);
                    }
                    (finish)&&finish();
                    //this.refCustomSnackbar.current?.open('El docente fue añadido al registro de forma exitosa.');
                });
            })
            .catch((error)=>{
                this.numProcess -= 1;
                this._goNoInvasiveLoading(false);
                this.refCustomSnackbar.current?.open(error.cause);
                (finish)&&finish();
            }); 
    }

    render(): ReactNode {
        const { theme } = this.context;
        return(<CustomModal visible={this.state.visible} onShow={this.loadData} onRequestClose={this.closeAndClean}>
            <PaperProvider theme={theme}>
                <View style={{ flex: 1 }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.closeAndClean} />
                        <Appbar.Content title={`Registro: ${this.state.select}`} />
                        <MenuComponent
                            disable={this.state.isLoading}
                            onDelete={this._openDelete}
                            onAddNote={this.createPDF}
                        />
                    </Appbar.Header>
                    <View style={{ flex: 2, backgroundColor: theme.colors.background }}>
                        <FlatList
                            data={this.state.data}
                            extraData={this.state}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            contentContainerStyle={{ paddingBottom: 80, flex: (this.state.setData.length == 0)? 2: undefined }}
                            ListEmptyComponent={()=><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún estudiante</Text></View>}
                            renderItem={this._renderItem}
                        />
                    </View>
                    <ComponentDialogs
                        ref={this.refComponentDialogs}
                        deleteAssist={this.delete}
                        deleteRow={this._deleteRowNow}
                    />
                    <CustomSnackbar ref={this.refCustomSnackbar} />
                </View>
            </PaperProvider>
            <CustomNoInvasiveLoading ref={this.refCustomNoInvasiveLoading} />
        </CustomModal>);
    }
}

type IProps3 = {
    deleteAssist: ()=>any;
    deleteRow: ()=>any;
};
type IState3 = {
    alertVisible: boolean;
    alertMessage: string;
    deleteVisible: boolean;
    deleteRowAssist: boolean;
};
class ComponentDialogs extends PureComponent<IProps3, IState3> {
    constructor(props: IProps3) {
        super(props);
        this.state = {
            alertVisible: false,
            alertMessage: '',
            deleteVisible: false,
            deleteRowAssist: false
        };
    }
    render(): React.ReactNode {
        return(<Portal>
            <Dialog visible={this.state.alertVisible} onDismiss={()=>this.setState({ alertVisible: false })}>
                <Dialog.Title>¡¡¡Atención!!!</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>{this.state.alertMessage}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={()=>this.setState({ alertVisible: false })}>Cerrar</Button>
                </Dialog.Actions>
            </Dialog>
            <Dialog visible={this.state.deleteVisible} onDismiss={()=>this.setState({ deleteVisible: false })}>
                <Dialog.Title>Espere por favor...</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>{"¿Estás seguro que quieres realizar esta acción?\n\nUna vez borrado el grupo, se eliminarán tambien todos los datos que contiene. Esta acción es irreversible."}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={()=>this.setState({ deleteVisible: false })}>Cancelar</Button>
                    <Button onPress={()=>this.setState({ deleteVisible: false }, this.props.deleteAssist)}>Aceptar</Button>
                </Dialog.Actions>
            </Dialog>
            <Dialog visible={this.state.deleteRowAssist} onDismiss={()=>this.setState({ deleteRowAssist: false })}>
                <Dialog.Title>Confirmar</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>Estas seguro/a que quiere remover el docente seleccionado del registro?</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={()=>this.setState({ deleteRowAssist: false })}>Cancelar</Button>
                    <Button onPress={()=>this.setState({ deleteRowAssist: false }, this.props.deleteRow)}>Aceptar</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>);
    }
}

type IProps2 = {
    disable: boolean;
    onDelete: ()=>any;
    onAddNote: ()=>any;
};
type IState2 = {
    isOpen: boolean;
};
class MenuComponent extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            isOpen: false
        };
        this._close = this._close.bind(this);
        this._open = this._open.bind(this);
        this._onDelete = this._onDelete.bind(this);
        this._onAddNote = this._onAddNote.bind(this);
    }
    _close() {
        this.setState({ isOpen: false });
    }
    _open() {
        this.setState({ isOpen: true });
    }
    // Functions
    _onDelete() {
        this._close();
        this.props.onDelete();
    }
    _onAddNote() {
        this._close();
        this.props.onAddNote();
    }
    render(): React.ReactNode {
        return(<Menu
            visible={this.state.isOpen}
            onDismiss={this._close}
            anchor={<Appbar.Action color={'#FFFFFF'} disabled={this.props.disable} icon={'dots-vertical'} onPress={this._open} />}>
            <Menu.Item icon={'delete-outline'} onPress={this._onDelete} title={"Eliminar"} />
            <Menu.Item icon={'file-pdf-box'} onPress={this._onAddNote} title={"Generar PDF"} />
            <Divider />
            <Menu.Item icon={'close'} onPress={this._close} title={"Cerrar"} />
        </Menu>);
    }
}