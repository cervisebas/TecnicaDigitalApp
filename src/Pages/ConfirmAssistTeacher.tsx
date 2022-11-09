import { decode } from "base-64";
import moment from "moment";
import React, { Component, createRef, PureComponent, ReactNode } from "react";
import { DeviceEventEmitter, FlatList, ListRenderItemInfo, Pressable, StyleSheet, ToastAndroid, View } from "react-native";
import { Appbar, Button, Checkbox, Colors, Dialog, Divider, FAB, List, Menu, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomModal from "../Components/CustomModal";
import ItemAssitTeacher from "../Components/Elements/CustomItem3";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";
import { ThemeContext } from "../Components/ThemeProvider";
import { Assist, urlBase } from "../Scripts/ApiTecnica";
import { AssistUserData, DataList } from "../Scripts/ApiTecnica/types";

type IProps = {
    showLoading: (v: boolean, t?: string)=>any;
    showSnackbar: (v: boolean, t: string, a?: ()=>any)=>any;
    openImage: (source: string, text: string)=>any;
    openAddAnnotation: ()=>any;
    openSetGroup: ()=>any;
};
type IState = {
    visible: boolean;
    select: string;
    setData: AssistUserData[];

    alertVisible: boolean;
    alertMessage: string;
    deleteVisible: boolean;

    isMenuOpen: boolean;
    isLoading: boolean;

    data: AssistUserData[];
    dataBackup: AssistUserData[];
    dataLog: DataList[];
    notify: boolean;

    isFilter: boolean;
    isAllMark: boolean;

    deleteRowAssist: boolean;
};

export default class ConfirmAssistTeacher extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            select: '',
            setData: [],
            alertVisible: false,
            alertMessage: '',
            deleteVisible: false,
            isMenuOpen: false,
            isLoading: false,
            data: [],
            dataBackup: [],
            dataLog: [],
            notify: true,
            isFilter: false,
            isAllMark: false,
            deleteRowAssist: false
        };
        this.closeAndClean = this.closeAndClean.bind(this);
        this.loadData = this.loadData.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._changeNotifyState = this._changeNotifyState.bind(this);
        this._openDelete = this._openDelete.bind(this);
        this._goSelectAll = this._goSelectAll.bind(this);
        this._deleteRowNow = this._deleteRowNow.bind(this);
    }
    static contextType = ThemeContext;
    private idDeleteRow: string = '-1';
    // Ref's
    private refCustomSnackbar = createRef<CustomSnackbar>();

    checkAction(idStudent: string, index: number) {
        let dataLog = this.state.dataLog;
        dataLog[index] = {
            check: !dataLog[index].check,
            idStudent,
            idAssist: dataLog[index].idAssist,
            exist: dataLog[index].exist
        };
        this.setState({ dataLog: dataLog });
    }
    loadData() {
        this.setState({
            data: this.state.setData,
            dataBackup: this.state.setData,
            dataLog: this.state.setData.map((s)=>({
                check: (s.exist)? s.status: false,
                idStudent: s.id,
                idAssist: s.idAssist,
                exist: s.exist
            }))
        });
    }
    closeAndClean() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.setState({ dataLog: [], data: [], notify: true });
        this.close();
    }
    delete() {
        /*this.props.showLoading(true, 'Eliminando registro...', ()=>
            Assist.deleteAssist(this.state.select.id)
                .then(()=>this.props.showLoading(false, 'Eliminando registro...', ()=>{
                    DeviceEventEmitter.emit('p1-reload', undefined, true);
                    this.props.showSnackbar(true, `Se elimino el registro de "${this.state.select.curse}".`, ()=>this.closeAndClean());
                }))
                .catch((error)=>this.props.showLoading(false, 'Eliminando registro...', ()=>this.setState({ alertVisible: true, alertMessage: error.cause })))
        );*/
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
            onPress={()=>undefined}
            onPressAdd={()=>this._addRowNow(item.id)}
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
    _changeNotifyState() {
        this.setState({ notify: !this.state.notify });
    }

    // Controller
    open(id: string, setData: AssistUserData[]) {
        this.setState({
            visible: true,
            select: id,
            setData
        });
    }
    close() {
        this.setState({
            visible: false,
            select: '',
            setData: [],
            dataLog: [],
            notify: true,
            isFilter: false,
            isAllMark: false
        });
    }
    setFilter(filter: string[]) {
        this.setState({
            data: this.state.dataBackup.filter((v)=>!!filter.find((v2)=>v2 == v.id)),
            dataLog: this.state.dataLog.filter((v)=>!!filter.find((v2)=>v2 == v.idStudent)),
            isFilter: true
        });
    }

    // News
    _openDelete() {
        this.setState({ deleteVisible: true });
    }
    _goSelectAll() {
        this.setState({
            dataLog: this.state.dataLog.map((val)=>({
                ...val,
                check: (!this.state.isAllMark)? true: false
            })),
            isAllMark: !this.state.isAllMark
        });
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

    // Row's Functions
    _onDeleteRow(idAssist: string) {
        this.idDeleteRow = idAssist;
        this.setState({ deleteRowAssist: true });
    }
    _deleteRowNow() {
        this.props.showLoading(true, 'Removiendo docente....');
        Assist.removeTeacherAssist(this.state.select, this.idDeleteRow)
            .then(()=>{
                this.props.showLoading(true, 'Regenerando registro...');
                const dataLog = this.state.dataLog.map((elm)=>{
                    if (elm.idStudent == this.idDeleteRow) return { ...elm, exist: false };
                    return elm;
                });
                const data = this.state.data.map((elm)=>{
                    if (elm.id == this.idDeleteRow) return { ...elm, id: '-1', existRow: false };
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
    _addRowNow(idTeacher: string) {
       this.props.showLoading(true, 'Añadiendo docente....');
        Assist.addTeacherAssist(this.state.select, idTeacher)
            .then((newId)=>{
                console.log(newId);
                this.props.showLoading(true, 'Regenerando registro...');
                const dataLog = this.state.dataLog.map((elm)=>{
                    if (elm.idStudent == idTeacher) return { ...elm, exist: true };
                    return elm;
                });
                const data = this.state.data.map((elm)=>{
                    if (elm.id == idTeacher) return { ...elm, id: newId, existRow: true };
                    return elm;
                });
                this.setState({ dataLog, data }, ()=>{
                    this.props.showLoading(false);
                    this.refCustomSnackbar.current?.open('El docente fue añadido al registro de forma exitosa.');
                });
            })
            .catch((error)=>{
                this.props.showLoading(false);
                this.refCustomSnackbar.current?.open(error.cause);
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
                            isFilter={this.state.isFilter}
                            isNotify={this.state.notify}
                            isAllMark={this.state.isAllMark}
                            onDelete={this._openDelete}
                            onAddNote={this.props.openAddAnnotation}
                            onGroup={this.props.openSetGroup}
                            onChangeNotify={this._changeNotifyState}
                            onSelectAll={this._goSelectAll}
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
                    <Portal>
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
                                <Button onPress={()=>this.setState({ deleteVisible: false }, ()=>this.delete())}>Aceptar</Button>
                            </Dialog.Actions>
                        </Dialog>
                        <Dialog visible={this.state.deleteRowAssist} onDismiss={()=>this.setState({ deleteRowAssist: false })}>
                            <Dialog.Title>Confirmar</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>Estas seguro/a que quiere remover el docente seleccionado del registro?</Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={()=>this.setState({ deleteRowAssist: false })}>Cancelar</Button>
                                <Button onPress={()=>this.setState({ deleteRowAssist: false }, this._deleteRowNow)}>Aceptar</Button>
                            </Dialog.Actions>
                        </Dialog>
                        <CustomSnackbar ref={this.refCustomSnackbar} />
                    </Portal>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}

type IProps2 = {
    disable: boolean;
    isFilter: boolean;
    isNotify: boolean;
    isAllMark: boolean;
    onDelete: ()=>any;
    onAddNote: ()=>any;
    onGroup: ()=>any;
    onChangeNotify: ()=>any;
    onSelectAll: ()=>any;
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
        this._onGroup = this._onGroup.bind(this);
        this._onSelectAll = this._onSelectAll.bind(this);
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
    _onGroup() {
        this._close();
        this.props.onGroup();
    }
    _onSelectAll() {
        this._close();
        this.props.onSelectAll();
    }
    render(): React.ReactNode {
        return(<Menu
            visible={this.state.isOpen}
            onDismiss={this._close}
            anchor={<Appbar.Action color={'#FFFFFF'} disabled={this.props.disable} icon={'dots-vertical'} onPress={this._open} />}>
            <Menu.Item icon={'delete-outline'} onPress={this._onDelete} title={"Eliminar"} />
            <Menu.Item icon={'note-edit-outline'} onPress={this._onAddNote} title={"Añadir anotación"} />
            {(!this.props.isFilter)&&<Menu.Item icon={'account-group-outline'} onPress={this._onGroup} title={"Usar grupo"} />}
            <Menu.Item icon={(this.props.isNotify)? 'bell-outline': 'bell-off-outline'} onPress={this.props.onChangeNotify} title={"Notificar"} />
            <Menu.Item icon={(this.props.isAllMark)? 'checkbox-multiple-blank-outline': 'checkbox-multiple-marked-outline'} onPress={this._onSelectAll} title={(this.props.isAllMark)? 'Desmarcar todo': 'Marcar todo'} />
            <Divider />
            <Menu.Item icon={'close'} onPress={this._close} title={"Cerrar"} />
        </Menu>);
    }
}

const styles = StyleSheet.create({
    items: {
        height: 64
    }
});