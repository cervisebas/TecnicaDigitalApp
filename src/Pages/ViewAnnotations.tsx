import { decode } from "base-64";
import React, { Component } from "react";
import { DeviceEventEmitter, FlatList, ListRenderItemInfo, ToastAndroid, View } from "react-native";
import { Appbar, Avatar, Button, Card, Dialog, IconButton, Paragraph, Portal, Provider, Text } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { ThemeContext } from "../Components/ThemeProvider";
import { Annotation, urlBase } from "../Scripts/ApiTecnica";
import { AnnotationList } from "../Scripts/ApiTecnica/types";

type Select = {
    id: string;
    curse: string;
    date: string;
    annotations: number;
};
type IProps= {
    goLoading: (visible: boolean, text: string, then?: ()=>any)=>any;
};
type IState= {
    visible: boolean;
    select: Select;
    data: AnnotationList[];
    showDeleteDialog: boolean;
    dataDelete: string;
};

export default class ViewAnnotations extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            select: this.selectDefault,
            data: [],
            showDeleteDialog: false,
            dataDelete: ''
        };
        this._renderItem = this._renderItem.bind(this);
        this.deleteNow = this.deleteNow.bind(this);
        this.onClose = this.onClose.bind(this);
        this.close = this.close.bind(this);
    }
    private selectDefault: Select = {
        id: '',
        curse: '',
        date: '',
        annotations: 0
    };
    static contextType = ThemeContext;

    deleteNow() {
        this.setState({ showDeleteDialog: false });
        this.props.goLoading(true, 'Borrando anotación...', ()=>
            Annotation.delete(this.state.dataDelete)
                .then(()=>this.props.goLoading(false, 'Borrando anotación...', ()=>{
                    ToastAndroid.show('Anotación borrada con éxito', ToastAndroid.SHORT);
                    DeviceEventEmitter.emit('restore-view-annotations');
                    DeviceEventEmitter.emit('p1-reload', 1);
                    this.close();
                }))
                .catch((error)=>this.props.goLoading(false, 'Borrando anotación...', ()=>ToastAndroid.show(error.cause, ToastAndroid.SHORT)))
        );
    }

    _keyExtractor({ id }: AnnotationList) {
        return `annotation-${id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<AnnotationList>) {
        return(<Card style={{ marginLeft: 8, marginBottom: 10, marginRight: 8 }} elevation={3}>
            <Card.Title
                key={`annotation-${item.id}`}
                title={decode(item.directive.name)}
                subtitle={item.date}
                subtitleStyle={{ marginLeft: 8, fontSize: 11 }}
                titleStyle={{ fontSize: 16 }}
                left={(props)=><Avatar.Image
                    {...props}
                    size={40}
                    source={{ uri: `${urlBase}/image/${decode(item.directive.picture)}` }}
                />}
                right={(props)=><IconButton
                    {...props}
                    icon={'delete-outline'}
                    onPress={()=>this.setState({ showDeleteDialog: true, dataDelete: item.id })}
                />}
            />
            <Card.Content><Text>{decode(item.note)}</Text></Card.Content>
        </Card>);
    }
    onClose() {
        this.setState({ showDeleteDialog: false, dataDelete: '' });
    }

    // Controller
    open(select: Select, data: AnnotationList[]) {
        this.setState({
            visible: true,
            select,
            data
        });
    }
    close() {
        if (this.state.showDeleteDialog) return this.setState({ showDeleteDialog: false });
        this.setState({
            visible: false,
            select: this.selectDefault,
            data: []
        });
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onClose={this.onClose} onRequestClose={this.close}>
            <View style={{ flex: 1, backgroundColor: (isDark)? theme.colors.surface: theme.colors.background, margin: 12, overflow: 'hidden', borderRadius: 8 }}>
                <Provider theme={theme}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={'Ver anotaciones'} />
                    </Appbar.Header>
                    <View style={{ flex: 2 }}>
                        <FlatList
                            data={this.state.data}
                            contentContainerStyle={{ paddingTop: 8 }}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                        />
                    </View>
                    <Portal>
                        <Dialog visible={this.state.showDeleteDialog} onDismiss={()=>this.setState({ showDeleteDialog: false })}>
                            <Dialog.Title>Espere por favor...</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>¿Estás seguro que quiere eliminar esta anotación? Esta acción no se podrá deshacer luego.</Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={()=>this.setState({ showDeleteDialog: false })}>Cancelar</Button>
                                <Button onPress={this.deleteNow}>Aceptar</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </Provider>
            </View>
        </CustomModal>);
    }
}