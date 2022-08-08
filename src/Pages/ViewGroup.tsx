import { decode } from "base-64";
import React, { Component, PureComponent, ReactNode } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, Pressable, StyleSheet, View } from "react-native";
import { Button, Appbar, Dialog, Divider, List, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomModal from "../Components/CustomModal";
import { Groups, urlBase } from "../Scripts/ApiTecnica";
import { StudentsData } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";

type IProps = {
    showLoading: (v: boolean, t: string, a?: ()=>any)=>any;
    openImage: (source: string, text: string)=>any;
    showSnackbar: (t: string, a?: ()=>any)=>any;
    goEdit: (after: StudentsData[], id: string, curse: string)=>any;
};
type IState = {
    visible: boolean;
    // Datas
    data: StudentsData[];
    id: string;
    curse: string;
    group: string;
    // Interfaz
    alertVisible: boolean;
    alertMessage: string;
    deleteVisible: boolean;
};

export default class ViewGroup extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            data: [],
            id: '',
            curse: '',
            group: '',
            alertVisible: false,
            alertMessage: '',
            deleteVisible: false,
        };
        this.delete = this.delete.bind(this);
        this.close = this.close.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._openDialogDelete = this._openDialogDelete.bind(this);
        this._goEdit = this._goEdit.bind(this);
    }
    private event: EmitterSubscription | null = null;
    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('show-dialog-add-annotation', (message: string)=>this.setState({ alertVisible: true, alertMessage: message }));
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event = null;
    }
    delete() {
        this.props.showLoading(true, 'Eliminando grupo...', ()=>
            Groups.delete(this.state.id)
                .then(()=>this.props.showLoading(false, 'Eliminando grupo...', ()=>{
                    DeviceEventEmitter.emit('p6-reload');
                    this.props.showSnackbar(`Se elimino el grupo ${this.state.group} de "${this.state.curse}".`, this.close);
                }))
                .catch((error)=>this.props.showLoading(false, 'Eliminando registro...', ()=>this.setState({ alertVisible: true, alertMessage: error.cause })))
        );
    }

    // Flatlist
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    _keyExtractor({ id }: StudentsData) {
        return `view-group-${id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<StudentsData>) {
        return(<List.Item
            key={`view-group-${item.id}`}
            title={decode(item.name)}
            style={styles.itemHeight}
            left={(props)=><Pressable {...props} style={styles.itemImage} onPress={()=>this.props.openImage(`${urlBase}/image/${decode(item.picture)}`, decode(item.name))}>
                <ImageLazyLoad
                    size={48}
                    circle
                    source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
                />
            </Pressable>}
        />);
    }
    _getItemLayout(_data: StudentsData[] | null | undefined, index: number) {
        return {
            length: 72,
            offset: 72 * index,
            index
        };
    }
    _openDialogDelete() {
        this.setState({ deleteVisible: true });
    }
    _goEdit() {
        this.props.goEdit(this.state.data, this.state.id, this.state.curse);
        this.close();
    }

    // Controller
    open(data: StudentsData[], curse: string, group: string, id: string) {
        this.setState({
            visible: true,
            data,
            id,
            curse,
            group
        });
    }
    close() {
        this.setState({
            visible: false,
            data: []
        });
    }

    render(): ReactNode {
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <PaperProvider theme={Theme}>
                <View style={{ flex: 1 }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={`Grupo ${this.state.group}: ${this.state.curse}`}  />
                        <Appbar.Action icon={'pencil'} onPress={this._goEdit} />
                        <Appbar.Action icon={'delete-outline'} onPress={this._openDialogDelete} />
                    </Appbar.Header>
                    <View style={{ flex: 2, backgroundColor: Theme.colors.background }}>
                        <FlatList
                            data={this.state.data}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            contentContainerStyle={{ paddingBottom: 72, flex: (this.state.data.length == 0)? 3: undefined }}
                            ListEmptyComponent={<ListEmpty />}
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
                            <Button onPress={()=>this.setState({ deleteVisible: false }, this.delete)}>Aceptar</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </PaperProvider>
        </CustomModal>);
    }
}

class ListEmpty extends PureComponent {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.emptyContent}>
            <Icon name={'account-alert-outline'} size={48} />
            <Text style={{ marginTop: 12 }}>No se encontraron estudiantes.</Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    emptyContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    itemHeight: {
        height: 72
    },
    itemImage: {
        justifyContent: 'center',
        alignItems: 'center'
    }
});