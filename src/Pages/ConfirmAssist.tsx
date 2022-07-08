import { decode } from "base-64";
import React, { Component, ReactNode } from "react";
import { DeviceEventEmitter, FlatList, Pressable, ToastAndroid, View } from "react-native";
import { Appbar, Avatar, Button, Checkbox, Colors, Dialog, Divider, FAB, List, Menu, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomModal from "../Components/CustomModal";
import { Assist, urlBase } from "../Scripts/ApiTecnica";
import { AssistUserData, DataList } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    close: ()=>any;
    select: { id: string; curse: string; };
    data: AssistUserData[];
    showLoading: (v: boolean, t: string, a?: ()=>any)=>any;
    showSnackbar: (v: boolean, t: string, a?: ()=>any)=>any;
    openImage: (source: string, text: string)=>any;
    openAddAnnotation: ()=>any;
};
type IState = {
    alertVisible: boolean;
    alertMessage: string;
    deleteVisible: boolean;

    isMenuOpen: boolean;
    isLoading: boolean;
};

export default class ConfirmAssist extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            alertVisible: false,
            alertMessage: '',
            deleteVisible: false,
            isMenuOpen: false,
            isLoading: false
        };
        this.closeAndClean = this.closeAndClean.bind(this);
    }
    private dataLog: DataList[] = [];
    checkAction(idStudent: string, index: number) {
        this.dataLog[index] = {
            check: (this.dataLog[index])? !this.dataLog[index].check: true,
            idStudent,
            idAssist: this.dataLog[index].idAssist,
            exist: this.dataLog[index].exist
        };
        this.forceUpdate();
    }
    loadData() {
        this.dataLog = this.props.data.map((s)=>({ check: s.status, idStudent: s.id, idAssist: s.idAssist, exist: s.exist }));
        this.forceUpdate();
    }
    closeAndClean() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.dataLog = [];
        this.props.close();
    }
    send() {
        if (this.props.data.length == 0) return ToastAndroid.show('Opción no disponible, no se encontró ningún estudiante en la lista...', ToastAndroid.SHORT);
        this.setState({ isLoading: true }, ()=>
            Assist.confirmAssist(this.props.select.id, this.dataLog)
                .then(()=>this.setState({ isLoading: false }, ()=>{
                    DeviceEventEmitter.emit('p1-reload');
                    this.props.showSnackbar(true, `Se confirmo el registro de "${this.props.select.curse}".`, ()=>this.closeAndClean());
                }))
                .catch((error)=>this.setState({ isLoading: false }, ()=>this.setState({ alertVisible: true, alertMessage: error.cause })))
        );
    }
    delete() {
        this.props.showLoading(true, 'Eliminando registro...', ()=>
            Assist.deleteAssist(this.props.select.id)
                .then(()=>this.props.showLoading(false, '', ()=>{
                    DeviceEventEmitter.emit('p1-reload');
                    this.props.showSnackbar(true, `Se elimino el registro de "${this.props.select.curse}".`, ()=>this.closeAndClean());
                }))
                .catch((error)=>this.props.showLoading(false, '', ()=>this.setState({ alertVisible: true, alertMessage: error.cause })))
        );
    }
    render(): ReactNode {
        return(<CustomModal visible={this.props.visible} onShow={()=>this.loadData()} onRequestClose={()=>this.closeAndClean()}>
            <PaperProvider theme={Theme}>
                <View style={{ flex: 1 }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={()=>this.closeAndClean()} />
                        <Appbar.Content title={`Registro: ${this.props.select.curse}`}  />
                        <Menu
                            visible={this.state.isMenuOpen}
                            onDismiss={()=>this.setState({ isMenuOpen: false })}
                            anchor={<Appbar.Action color={'#FFFFFF'} disabled={this.state.isLoading} icon={'dots-vertical'} onPress={()=>this.setState({ isMenuOpen: true })} />}>
                            <Menu.Item icon={'delete-outline'} onPress={()=>this.setState({ isMenuOpen: false, deleteVisible: true })} title={"Eliminar"} />
                            <Menu.Item icon={'note-edit-outline'} onPress={()=>this.setState({ isMenuOpen: false }, ()=>this.props.openAddAnnotation())} title={"Añadir anotación"} />
                            <Divider />
                            <Menu.Item icon={'close'} onPress={()=>this.setState({ isMenuOpen: false })} title="Cerrar" />
                        </Menu>
                    </Appbar.Header>
                    <View style={{ flex: 2, backgroundColor: Theme.colors.background }}>
                        <FlatList
                            data={this.props.data}
                            ItemSeparatorComponent={()=><Divider />}
                            keyExtractor={(item)=>`conf-assist-${item.id}`}
                            contentContainerStyle={{ paddingBottom: 80, flex: (this.props.data.length == 0)? 2: undefined }}
                            ListEmptyComponent={()=><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún estudiante</Text></View>}
                            renderItem={({ item, index })=><List.Item
                                key={`conf-assist-${item.id}`}
                                title={decode(item.name)}
                                description={(item.exist)? 'Ingreso con credencial': undefined}
                                disabled={this.state.isLoading}
                                onPress={()=>this.checkAction(item.id, index)}
                                left={(props)=><Pressable {...props} style={{ justifyContent: 'center', alignItems: 'center' }} onPress={()=>this.props.openImage(`${urlBase}/image/${decode(item.picture)}`, decode(item.name))}><Avatar.Image
                                    size={48}
                                    source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
                                /></Pressable>}
                                right={()=><View style={{ justifyContent: 'center' }}>
                                    <Checkbox
                                        color={Colors.blue500}
                                        uncheckedColor={Colors.red500}
                                        disabled={this.state.isLoading}
                                        status={(this.dataLog[index])? (this.dataLog[index].check)? 'checked': 'unchecked': 'unchecked'}
                                        onPress={()=>this.checkAction(item.id, index)} />
                                </View>}
                            />}
                        />
                    </View>
                    <FAB
                        icon={'send'}
                        label={(this.state.isLoading)? 'ENVIANDO': 'ENVIAR'}
                        onPress={()=>(!this.state.isLoading)? this.send(): undefined}
                        loading={this.state.isLoading}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            marginBottom: 16,
                            marginLeft: 96,
                            marginRight: 96
                        }}
                    />
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
                    </Portal>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}
