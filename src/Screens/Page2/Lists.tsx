import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, Dimensions, EmitterSubscription, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import CustomCard4 from "../../Components/Elements/CustomCard4";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemeContext } from "../../Components/ThemeProvider";
import { DataSchedule } from "../../Scripts/ApiTecnica/types";
import { ActivityIndicator, Button, Dialog, IconButton, Paragraph, Portal, Text } from "react-native-paper";
import { Schedules } from "../../Scripts/ApiTecnica";
import { decode } from "base-64";
import ViewSchedule from "../../Pages/ViewSchedule";
import EditShedule from "./EditSchedule";
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
    datas: DataSchedule[];
    numColumns: number;
};

export default class Page2Lists extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            isRefresh: false,
            isError: false,
            messageError: '',
            datas: [],
            numColumns: 2
        };
        this._renderItem = this._renderItem.bind(this);
        this.loadData = this.loadData.bind(this);
        this.goDelete = this.goDelete.bind(this);
    }
    private event: EmitterSubscription | undefined = undefined;
    private idDelete: string = '-1';
    static contextType = ThemeContext;
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refViewSchedule = createRef<ViewSchedule>();
    private refEditShedule = createRef<EditShedule>();
    private refDialogDelete = createRef<DialogDelete>();

    componentDidMount() {
        this.event = DeviceEventEmitter.addListener('p2-lists-reload', (reload?: boolean)=>this.setState({ isRefresh: !!reload }, this.loadData));
        const { width } = Dimensions.get('window');
        this.setState({ numColumns: ((width/2) >= 200)? 2: 1 });
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
            Schedules.getAll()
                .then((datas)=>{
                    this.setState({ datas, isLoading: false, isRefresh: false });
                    this.props.handlerLoad(true);
                })
                .catch((error)=>this.setState({ isLoading: false, isError: true, messageError: error.cause }))
        );
    }
    goDelete() {
        this.props.goLoading(true, 'Eliminando horario...');
        Schedules.delete(this.idDelete)
            .then(()=>{
                this.setState({ isRefresh: true }, this.loadData);
                this.props.goLoading(false);
                this.refCustomSnackbar.current?.open('Se elimino correctamente el horario.');
            })
            .catch((error)=>{
                this.props.goLoading(false);
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }

    openSchedule(data: DataSchedule) {
        this.refViewSchedule.current?.open(data);
    }
    onDelete(idDelete: string) {
        this.idDelete = idDelete;
        this.refDialogDelete.current?.open();
    }

    // FlatList
    _renderItem({ item, index }: ListRenderItemInfo<DataSchedule>) {
        return(<CustomCard4
            key={`card-num-${item.id}`}
            title={`Curso ${decode(item.curse)}`}
            subtitle={''}
            position={(index%2 == 0)? 'left': 'right'}
            numColumns={this.state.numColumns}
            onPress={()=>this.openSchedule(item)}
            onEdit={()=>this.refEditShedule.current?.open(item)}
            onDelete={()=>this.onDelete(item.id)}
        />);
    }
    _getItemLayout(_data: DataSchedule[] | null | undefined, index: number) {
        return {
            length: 128,
            offset: 128 * index,
            index
        };
    }

    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View style={styles.content}>
            {(!this.state.isLoading)? (!this.state.isError)?
            <FlatList
                key={`Page2ListTimes${this.state.numColumns}`}
                data={this.state.datas}
                numColumns={this.state.numColumns}
                contentContainerStyle={{
                    flex: (this.state.datas.length == 0)? 1: undefined,
                    paddingBottom: 84,
                    paddingTop: 8
                }}
                refreshControl={<RefreshControl colors={[theme.colors.primary]} progressBackgroundColor={theme.colors.surface} refreshing={this.state.isRefresh} onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)} />}
                getItemLayout={this._getItemLayout}
                ListEmptyComponent={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} color={theme.colors.text} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningúna lista</Text></View>}
                renderItem={this._renderItem}
            />:
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Icon name={'account-alert-outline'} size={48} color={theme.colors.text} style={{ fontSize: 48 }} />
                    <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                    <IconButton icon={'reload'} color={theme.colors.primary} size={28} onPress={this.loadData} style={{ marginTop: 12 }} />
                </View>
            </View>
            :<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={'large'} animating /></View>}
            
            <DialogDelete ref={this.refDialogDelete} onDelete={this.goDelete} />
            <CustomSnackbar style={styles.snackbar} ref={this.refCustomSnackbar} />
            {/* ##### Modal's ##### */}
            <ViewSchedule ref={this.refViewSchedule} goLoading={this.props.goLoading} />
            <EditShedule ref={this.refEditShedule} goLoading={this.props.goLoading} />
        </View>);
    }
}

type IProps2 = {
    onDelete?: ()=>any;
};
type IState2 = {
    visible: boolean;
};
class DialogDelete extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            visible: false
        };
        this.close = this.close.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    onDelete() {
        this.setState({ visible: false });
        (this.props.onDelete)&&this.props.onDelete();
    }
    render(): React.ReactNode {
        return(<Portal>
            <Dialog visible={this.state.visible} onDismiss={this.close}>
                <Dialog.Title>Espere por favor...</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>¿Estás seguro que quiere eliminar este horario? Esta acción no se podrá deshacer luego.</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={this.close}>Cancelar</Button>
                    <Button onPress={this.onDelete}>Aceptar</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    snackbar: {
        bottom: 76
    }
});