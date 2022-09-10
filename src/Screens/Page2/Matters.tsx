import { decode } from "base-64";
import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Dialog, Divider, IconButton, List, Paragraph, Portal, Text } from "react-native-paper";
import { Matter } from "../../Scripts/ApiTecnica/types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Theme from "../../Themes";
import { Matters } from "../../Scripts/ApiTecnica";
import CustomSnackbar from "../../Components/Elements/CustomSnackbar";

type IProps = {
    handlerLoad: (status: boolean)=>any;
    goLoading: (visible: boolean, message?: string)=>any;
};
type IState = {
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;
    datas: Matter[];
};

export default class Page2Matters extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            isRefresh: false,
            isError: false,
            messageError: '',
            datas: []
        };
        this.loadData = this.loadData.bind(this);
        this.goDelete = this.goDelete.bind(this);
        this._refreshNow = this._refreshNow.bind(this);
        this._renderItem = this._renderItem.bind(this);
    }
    private refDialogDelete = createRef<DialogDeleteMatter>();
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private event: EmitterSubscription | undefined = undefined;
    private idDelete: string = '-1';

    componentDidMount(): void {
        this.event = DeviceEventEmitter.addListener('p2-matters-reload', (isRefresh?: boolean | undefined)=>this.setState({ isRefresh: !!isRefresh }, this.loadData));
        this.loadData();
    }
    componentWillUnmount(): void {
        this.event?.remove();
    }
    loadData() {
        if (!this.state.isRefresh) {
            this.props.handlerLoad(false);
            this.setState({ isLoading: true, datas: [] });
        }
        this.setState({ isError: false }, ()=>
            Matters.getAll()
                .then((datas)=>{
                    this.setState({ datas, isLoading: false, isRefresh: false });
                    this.props.handlerLoad(true);
                })
                .catch((error)=>this.setState({ isLoading: false, isError: true, messageError: error.cause }))
        );
    }
    goDelete() {
        this.props.goLoading(true, 'Eliminando...');
        Matters.delete(this.idDelete)
            .then(()=>{
                this.refCustomSnackbar.current?.open('Materia borrada con éxito.');
                this.props.goLoading(false);
                this.setState({ isRefresh: true }, this.loadData);
            })
            .catch((error)=>{
                this.refCustomSnackbar.current?.open(error.cause);
                this.props.goLoading(false);
            })
    }
    onDelete(id: string) {
        this.refDialogDelete.current?.open();
        this.idDelete = id;
    }

    _refreshNow() {
        this.setState({ isRefresh: true }, this.loadData);
    }
    /* ##### Flatlist ##### */
    _renderItem({ item }: ListRenderItemInfo<Matter>) {
        return(<List.Item
            key={`matter-item-${item.id}-teacher-${item.teacher.id}`}
            title={decode(item.name)}
            description={(item.teacher.id == '-1')? "Sin profesor": decode(item.teacher.name)}
            style={styles.item}
            descriptionStyle={styles.itemDescription}
            left={(props)=><List.Icon {...props} icon={'folder-account-outline'} />}
            right={(props)=><IconButton
                {...props}
                icon={'delete-outline'}
                onPress={()=>this.onDelete(item.id)}
            />}
        />);
    }
    _keyExtractor(item: Matter) {
        return `matter-item-${item.id}-teacher-${item.teacher.id}`;
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    _getItemLayout(_data: Matter[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * index,
            index
        };
    }
    /* #################### */

    render(): React.ReactNode {
        return(<View style={styles.content}>
            <View style={{ flex: 1, overflow: 'hidden' }}>
                {(!this.state.isLoading)? (!this.state.isError)?
                <FlatList
                    data={this.state.datas}
                    extraData={this.state}
                    keyExtractor={this._keyExtractor}
                    getItemLayout={this._getItemLayout}
                    refreshControl={<RefreshControl colors={[Theme.colors.primary]} refreshing={this.state.isRefresh} onRefresh={this._refreshNow} />}
                    contentContainerStyle={{ flex: (this.state.datas.length == 0)? 2: undefined, paddingTop: 8 }}
                    ItemSeparatorComponent={this._ItemSeparatorComponent}
                    ListEmptyComponent={()=><View style={styles.emptyContent}><Icon name={'playlist-remove'} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ninguna materia</Text></View>}
                    renderItem={this._renderItem}
                />:
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} />
                        <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                        <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={this.loadData} style={{ marginTop: 12 }} />
                    </View>
                </View>
                :<View style={styles.loadingContent}><ActivityIndicator size={'large'} animating /></View>}
            </View>
            <CustomSnackbar style={styles.snackbar} ref={this.refCustomSnackbar} />
            <DialogDeleteMatter ref={this.refDialogDelete} onConfirm={this.goDelete} />
        </View>);
    }
}

type IProps2 = {
    onConfirm: ()=>any;
};
type IState2 = {
    visible: boolean;
};

class DialogDeleteMatter extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            visible: false
        };
        this.close = this.close.bind(this);
        this.confirm = this.confirm.bind(this);
    }
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    confirm() {
        this.setState({ visible: false }, this.props.onConfirm);
    }
    render(): React.ReactNode {
        return(<Portal>
            <Dialog visible={this.state.visible} onDismiss={this.close}>
                <Dialog.Title>Espere por favor...</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>{"¿Estás seguro que quieres realizar esta acción?\n\nUna vez borrado la materia, se eliminarán tambien todos los datos que contiene. Esta acción es irreversible."}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={this.close}>Cancelar</Button>
                    <Button onPress={this.confirm}>Aceptar</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    emptyContent: {
        flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
    },
    loadingContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    item: {
        height: 64
    },
    itemDescription: {
        marginLeft: 4
    },
    snackbar: {
        bottom: 76
    }
});