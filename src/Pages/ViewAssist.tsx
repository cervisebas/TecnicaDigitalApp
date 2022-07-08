import { decode } from "base-64";
import React, { Component, ReactNode } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, Linking, PermissionsAndroid, Pressable, ToastAndroid, View } from "react-native";
import { Button, Appbar, Avatar, Colors, Dialog, Divider, FAB, List, Paragraph, Portal, Provider as PaperProvider } from "react-native-paper";
import FileViewer from "react-native-file-viewer";
import CustomModal from "../Components/CustomModal";
import { Annotation, Assist, GeneratePDF, urlBase } from "../Scripts/ApiTecnica";
import { AnnotationList, AssistUserData } from "../Scripts/ApiTecnica/types";
import RNFS from "react-native-fs";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    close: ()=>any;
    select: { id: string; curse: string; date: string; hour: string; annotations: number; };
    data: AssistUserData[];
    editAssist: (id: string, datas: { id: string; curse: string; })=>any;
    showLoading: (v: boolean, t: string, a?: ()=>any)=>any;
    showSnackbar: (v: boolean, t: string, a?: ()=>any)=>any;
    openAnnotations: (data: AnnotationList[])=>any;
    openImage: (source: string, text: string)=>any;
    openAddAnnotation: ()=>any;
};
type IState = {
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
            fabShow: false,
            alertVisible: false,
            alertMessage: '',
            deleteVisible: false,
            isLoadingAnnotations: false
        };
        this.openEditAssist = this.openEditAssist.bind(this);
        this.generatePdf = this.generatePdf.bind(this);
        this.openViewAnnotation = this.openViewAnnotation.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('show-dialog-add-annotation', (message: string)=>this.setState({ alertVisible: true, alertMessage: message }));
        this.event2 = DeviceEventEmitter.addListener('restore-view-annotations', ()=>this.openViewAnnotation());
    }
    componentWillUnmount() {
        this.setState({
            alertMessage: '',
            isLoadingAnnotations: false
        });
        this.event?.remove();
        this.event2?.remove();
        this.event = null;
        this.event2 = null;
    }
    openEditAssist() {
        this.props.editAssist(this.props.select.id, this.props.select);
    }
    openViewAnnotation() {
        if (this.props.select.annotations == 0) return ToastAndroid.show('No se encontraron anotaciones.', ToastAndroid.SHORT);
        this.setState({ isLoadingAnnotations: true }, ()=>
            Annotation.getAll(this.props.select.id)
                .then((value)=>this.setState({ isLoadingAnnotations: false }, ()=>{
                    if (value.length == 0) return;
                    this.props.openAnnotations(value);
                }))
                .catch((error)=>this.setState({ isLoadingAnnotations: false }, ()=>ToastAndroid.show(error.cause, ToastAndroid.SHORT)))
        );
    }
    delete() {
        this.props.showLoading(true, 'Eliminando registro...', ()=>
            Assist.deleteAssist(this.props.select.id)
                .then(()=>this.props.showLoading(false, '', ()=>{
                    DeviceEventEmitter.emit('p1-reload');
                    this.props.showSnackbar(true, `Se elimino el registro de "${this.props.select.curse}".`, ()=>this.props.close());
                }))
                .catch((error)=>this.props.showLoading(false, '', ()=>this.setState({ alertVisible: true, alertMessage: error.cause })))
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
            var students = this.props.data.map((item)=>({ name: item.name, status: item.status }));
            GeneratePDF.generatePdf({ curse: this.props.select.curse, date: this.props.select.date, hour: this.props.select.hour, students }, true)
                .then((value)=>this.props.showLoading(false, '', ()=>
                    FileViewer.open(value, { showOpenWithDialog: true, showAppsSuggestions: true })
                        .catch(()=>this.setState({ alertVisible: true, alertMessage: 'Ocurrió un problema al abrir el archivo generado.' }))
                ))
                .catch((err)=>this.props.showLoading(false, '', ()=>this.setState({ alertVisible: true, alertMessage: err })));
        });
    }
    async verifyFolder() {
        if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`)) RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`);
    }
    render(): ReactNode {
        return(<CustomModal visible={this.props.visible} onRequestClose={()=>this.props.close()}>
            <PaperProvider theme={Theme}>
                <View style={{ flex: 1 }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={()=>this.props.close()} />
                        <Appbar.Content title={`Ver registro: ${this.props.select.curse}`}  />
                        <Appbar.Action icon={'pencil'} onPress={this.openEditAssist} />
                    </Appbar.Header>
                    <View style={{ flex: 2, backgroundColor: Theme.colors.background }}>
                        <FlatList
                            data={this.props.data}
                            ItemSeparatorComponent={()=><Divider />}
                            keyExtractor={(item)=>`view-assist-${item.id}`}
                            contentContainerStyle={{ paddingBottom: 72 }}
                            renderItem={({ item })=><List.Item
                                key={`view-assist-${item.id}`}
                                title={decode(item.name)}
                                description={(item.status)? decode(item.time): undefined}
                                left={(props)=><Pressable {...props} style={{ justifyContent: 'center', alignItems: 'center' }} onPress={()=>this.props.openImage(`${urlBase}/image/${decode(item.picture)}`, decode(item.name))}><Avatar.Image
                                size={48}
                                source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
                            /></Pressable>}
                                right={()=><List.Icon
                                    icon={(item.status)? 'radiobox-marked': 'radiobox-blank'}
                                    color={(item.status)? Colors.blue500: Colors.red500}
                                />}
                            />}
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
                        label={this.props.select.annotations.toString()}
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
