import { decode } from "base-64";
import React, { Component, ReactNode } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, PermissionsAndroid, Pressable, StyleSheet, ToastAndroid, View } from "react-native";
import { Button, Appbar, Colors, Dialog, Divider, FAB, List, Paragraph, Portal, Provider as PaperProvider } from "react-native-paper";
import FileViewer from "react-native-file-viewer";
import CustomModal from "../Components/CustomModal";
import { Annotation, Assist, GeneratePDF, urlBase } from "../Scripts/ApiTecnica";
import { AnnotationList, AssistUserData } from "../Scripts/ApiTecnica/types";
import RNFS from "react-native-fs";
import Theme from "../Themes";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";

type Select = {
    id: string;
    curse: string;
    date: string;
    hour: string;
    annotations: number;
};
type IProps = {
    editAssist: (id: string, datas: { id: string; curse: string; })=>any;
    showLoading: (v: boolean, t: string, a?: ()=>any)=>any;
    showSnackbar: (v: boolean, t: string, a?: ()=>any)=>any;
    openAnnotations: (data: AnnotationList[])=>any;
    openImage: (source: string, text: string)=>any;
    openAddAnnotation: ()=>any;
};
type IState = {
    visible: boolean;
    select: Select;
    data: AssistUserData[];

    fabShow: boolean;
    alertVisible: boolean;
    alertMessage: string;
    deleteVisible: boolean;
    isLoadingAnnotations: boolean;
};

export default class ViewAssist extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            select: this.selectDefault,
            data: [],
            fabShow: false,
            alertVisible: false,
            alertMessage: '',
            deleteVisible: false,
            isLoadingAnnotations: false
        };
        this.openEditAssist = this.openEditAssist.bind(this);
        this.generatePdf = this.generatePdf.bind(this);
        this.openViewAnnotation = this.openViewAnnotation.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this.close = this.close.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private selectDefault: Select = {
        id: '',
        curse: '',
        date: '',
        hour: '',
        annotations: 0
    };
    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('show-dialog-add-annotation', (message: string)=>this.setState({ alertVisible: true, alertMessage: message }));
        this.event2 = DeviceEventEmitter.addListener('restore-view-annotations', ()=>this.openViewAnnotation('auto'));
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event2?.remove();
        this.event = null;
        this.event2 = null;
    }
    openEditAssist() {
        this.props.editAssist(this.state.select.id, this.state.select);
        this.close();
    }
    openViewAnnotation(auto?: 'auto') {
        if (this.state.select.annotations == 0) return (auto !== 'auto')&&ToastAndroid.show('No se encontraron anotaciones.', ToastAndroid.SHORT);
        this.setState({ isLoadingAnnotations: true }, ()=>
            Annotation.getAll(this.state.select.id)
                .then((value)=>this.setState({ isLoadingAnnotations: false }, ()=>{
                    if (value.length == 0) return;
                    this.props.openAnnotations(value);
                }))
                .catch((error)=>this.setState({ isLoadingAnnotations: false }, ()=>ToastAndroid.show(error.cause, ToastAndroid.SHORT)))
        );
    }
    delete() {
        this.props.showLoading(true, 'Eliminando registro...', ()=>
            Assist.deleteAssist(this.state.select.id)
                .then(()=>this.props.showLoading(false, 'Eliminando registro...', ()=>{
                    DeviceEventEmitter.emit('p1-reload');
                    this.props.showSnackbar(true, `Se elimino el registro de "${this.state.select.curse}".`, this.close);
                }))
                .catch((error)=>this.props.showLoading(false, 'Eliminando registro...', ()=>this.setState({ alertVisible: true, alertMessage: error.cause })))
        );
    }
    async generatePdf() {
        const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
            title: "Atención",
            message: "Para guardar la imagen se necesita acceder al almacenamiento de su dispositivo, por favor acepte los permisos que se requieren.",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar"
        });
        if (permission == PermissionsAndroid.RESULTS.DENIED) return this.setState({ alertVisible: true, alertMessage: 'Se denegó el acceso al almacenamiento.' });
        await this.verifyFolder();
        this.props.showLoading(true, 'Generando archivo PDF...', ()=>{
            var students = this.state.data.map((item)=>({ name: item.name, status: item.status }));
            GeneratePDF.generatePdf({ curse: this.state.select.curse, date: this.state.select.date, hour: this.state.select.hour, students }, true)
                .then((value)=>this.props.showLoading(false, 'Generando archivo PDF...', ()=>
                    FileViewer.open(value, { showOpenWithDialog: true, showAppsSuggestions: true })
                        .catch(()=>this.setState({ alertVisible: true, alertMessage: 'Ocurrió un problema al abrir el archivo generado.' }))
                ))
                .catch((err)=>this.props.showLoading(false, 'Generando archivo PDF...', ()=>this.setState({ alertVisible: true, alertMessage: err })));
        });
    }
    async verifyFolder() {
        if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`)) RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`);
    }

    // Flatlist
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    _keyExtractor({ id }: AssistUserData) {
        return `view-assist-${id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<AssistUserData>) {
        return(<List.Item
            key={`view-assist-${item.id}`}
            title={decode(item.name)}
            style={styles.itemHeight}
            description={(item.status)? `${decode(item.time)}${(item.exist)? ' (Ingreso con credencial)': ''}`: undefined}
            left={(props)=><Pressable {...props} style={{ justifyContent: 'center', alignItems: 'center' }} onPress={()=>this.props.openImage(`${urlBase}/image/${decode(item.picture)}`, decode(item.name))}>
                <ImageLazyLoad
                    size={48}
                    circle
                    source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
                />
            </Pressable>}
            right={()=><List.Icon
                icon={(item.status)? 'radiobox-marked': 'radiobox-blank'}
                color={(item.status)? Colors.blue500: Colors.red500}
            />}
        />);
    }
    _getItemLayout(_data: AssistUserData[] | null | undefined, index: number) {
        return {
            length: 72,
            offset: 72 * index,
            index
        };
    }

    // Controller
    open(select: Select, data: AssistUserData[]) {
        this.setState({
            visible: true,
            select,
            data
        });
    }
    close() {
        this.setState({
            visible: false,
            select: this.selectDefault,
            data: []
        });
    }
    updateSelect(select: Select) {
        this.setState({ select });
    }

    render(): ReactNode {
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <PaperProvider theme={Theme}>
                <View style={{ flex: 1 }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={`Ver registro: ${this.state.select.curse}`}  />
                        <Appbar.Action icon={'pencil'} onPress={this.openEditAssist} />
                    </Appbar.Header>
                    <View style={{ flex: 2, backgroundColor: Theme.colors.background }}>
                        <FlatList
                            data={this.state.data}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            contentContainerStyle={{ paddingBottom: 72 }}
                            renderItem={this._renderItem}
                        />
                    </View>
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
                    <FAB
                        icon={'note-edit-outline'}
                        label={this.state.select.annotations.toString()}
                        loading={this.state.isLoadingAnnotations}
                        onPress={this.openViewAnnotation}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            margin: 16
                        }}
                    />
                    <FAB.Group
                        visible
                        open={this.state.fabShow}
                        icon={(!this.state.fabShow)? 'cog-outline': 'close'}
                        actions={[{
                            icon: 'delete-outline',
                            label: 'Borrar',
                            onPress: ()=>this.setState({ deleteVisible: true }),
                        }, {
                            icon: 'file-pdf-box',
                            label: 'Crear PDF',
                            onPress: this.generatePdf,
                        }, {
                            icon: 'note-edit-outline',
                            label: 'Añadir anotación',
                            onPress: ()=>this.props.openAddAnnotation(),
                        }]}
                        onStateChange={({ open })=>this.setState({ fabShow: open })}
                    />
                </Portal>
            </PaperProvider>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    itemHeight: {
        height: 72
    }
});