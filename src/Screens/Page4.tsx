import React, { Component, createRef } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { Button, ActivityIndicator, Appbar, Dialog, Divider, IconButton, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import { DirectivesList } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import { Directive, urlBase } from "../Scripts/ApiTecnica";
import ItemDirective from "../Components/Elements/CustomItem2";
import { decode } from "base-64";
import ViewDirective from "../Pages/ViewDirective";
import LoadingController from "../Components/loading/loading-controller";
import AddDirective from "../Pages/AddDirective";
import EditDirective from "../Pages/EditDirective";
import ChangePasswordDirective from "../Pages/ChangePasswordDirective";
import ChangePermissionDirective from "../Pages/ChangePermissionDirective";
import ImageViewer from "../Pages/ImageViewer";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";

type IProps = {
    navigation: any;
};
type IState = {
    isLoading: boolean;
    isError: boolean;
    isRefresh: boolean;
    messageError: string;
    datas: DirectivesList[];
    showLoading: boolean;
    textLoading: string;
    showConfirmDelete: boolean;
};

export default class Page4 extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            isError: false,
            isRefresh: false,
            messageError: '',
            datas: [],
            showLoading: false,
            textLoading: '',
            showConfirmDelete: false
        };
        this._renderItem = this._renderItem.bind(this);
        this.loadData = this.loadData.bind(this);
        this.selectEditOptions = this.selectEditOptions.bind(this);
        this.deleteNow = this.deleteNow.bind(this);
        this.openImageViewer = this.openImageViewer.bind(this);
        this.showSnackbar = this.showSnackbar.bind(this);
        this._openAddDirective = this._openAddDirective.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private optionsMenuEdit: any[] = [
        <Text style={styles.optionAction}>Editar información</Text>,
        <Text style={styles.optionAction}>Cambiar contraseña</Text>,
        <Text style={styles.optionAction}>Cambiar permisos</Text>,
        'Cancelar'
    ];
    private idOptionSelect: string = '-1';
    // Refs    
    private actionSheet = createRef<ActionSheet>();
    private refViewDirective = createRef<ViewDirective>();
    private refImageViewer = createRef<ImageViewer>();
    private refAddDirective = createRef<AddDirective>();
    private refEditDirective = createRef<EditDirective>();
    private refChangePasswordDirective = createRef<ChangePasswordDirective>();
    private refChangePermissionDirective = createRef<ChangePermissionDirective>();
    private refCustomSnackbar = createRef<CustomSnackbar>();


    componentDidMount() {
        this.loadData();
        this.event = DeviceEventEmitter.addListener('reload-page4', (isRefresh?: boolean | undefined)=>this.setState({ isRefresh: !!isRefresh }, this.loadData));
        this.event2 = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
    }
    componentWillUnmount() {
        this.event?.remove();
        this.event2?.remove();
        this.event = null;
        this.event2 = null;
    }
    loadData() {
        var isLoading = !this.state.isRefresh;
        (isLoading)&&this.setState({ datas: [] });
        this.setState({ isError: false, isLoading }, ()=>
            Directive.getAll()
                .then((value)=>this.setState({ datas: value, isLoading: false, isRefresh: false }))
                .catch((error)=>this.setState({ isLoading: false, isError: true, isRefresh: false, messageError: error.cause }))
        );
    }

    /* ###### Flatlist ###### */
    _keyExtractor({ id }: DirectivesList) {
        return `directive-list-${id}`;
    }
    _getItemLayout(_data: DirectivesList[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * index,
            index
        };
    }
    _renderItem({ item }: ListRenderItemInfo<DirectivesList>) {
        return(<ItemDirective
            title={decode(item.name)}
            position={decode(item.position)}
            permission={parseInt(item.permission)}
            source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
            onPress={()=>this.refViewDirective.current?.open(item)}
            onEdit={()=>{
                this.idOptionSelect = item.id;
                this.actionSheet.current?.show();
            }}
            onDelete={()=>{
                this.idOptionSelect = item.id;
                this.setState({ showConfirmDelete: true });
            }}
        />);
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    /* ###################### */

    deleteNow() {
        this.setState({ showLoading: true, textLoading: 'Eliminado directivo...' }, ()=>
            Directive.delete(this.idOptionSelect)
                .then(()=>{
                    this.refCustomSnackbar.current?.open('El directivo se eliminó correctamente.');
                    this.setState({ showLoading: false, isRefresh: true }, this.loadData);
                })
                .catch((error)=>{
                    this.refCustomSnackbar.current?.open(error.cause);
                    this.setState({ showLoading: false });
                })
        );
    }
    selectEditOptions(opt: number) {
        switch (opt) {
            case 0:
                var data = this.state.datas.find((v)=>this.idOptionSelect == v.id);
                this.refEditDirective.current?.open(data!);
                break;
            case 1:
                var data = this.state.datas.find((v)=>this.idOptionSelect == v.id);
                this.refChangePasswordDirective.current?.open(data!);
                break;
            case 2:
                var data = this.state.datas.find((v)=>this.idOptionSelect == v.id);
                this.refChangePermissionDirective.current?.open(data!);
                break;
        }
    }
    openImageViewer(source: string) {
        this.refImageViewer.current?.open(source);
    }
    showSnackbar(visible: boolean, text: string) {
        if (!visible) return this.refCustomSnackbar.current?.close();
        this.refCustomSnackbar.current?.open(text);
    }
    _openAddDirective() {
        this.refAddDirective.current?.open();
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar>
                    <Appbar.Action icon={'menu'} onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Directivos'}  />
                    <Appbar.Action icon={'account-plus-outline'} onPress={this._openAddDirective} />
                </Appbar>
                <View style={{ flex: 2, overflow: 'hidden' }}>
                    {(!this.state.isLoading && !this.state.isError)? <FlatList
                        data={this.state.datas}
                        extraData={this.state}
                        contentContainerStyle={{ paddingTop: 8 }}
                        refreshControl={<RefreshControl refreshing={this.state.isRefresh} colors={[Theme.colors.primary]} onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)} />}
                        ItemSeparatorComponent={this._ItemSeparatorComponent}
                        getItemLayout={this._getItemLayout}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />:
                    <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                        {(!this.state.isError)? <ActivityIndicator size={'large'} animating />:
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} />
                                <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                                <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={()=>this.setState({ isRefresh: true, isError: false }, this.loadData)} style={{ marginTop: 12 }} />
                            </View>
                        </View>}
                    </View>}
                </View>
                <CustomSnackbar ref={this.refCustomSnackbar} />
                <Portal>
                    <Dialog visible={this.state.showConfirmDelete} onDismiss={()=>this.setState({ showConfirmDelete: false })}>
                        <Dialog.Title>Confirmar por favor</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Realizar esta acción es irreversible, por favor confirme si en verdad está seguro/a.</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={()=>this.setState({ showConfirmDelete: false })}>Cancelar</Button>
                            <Button onPress={()=>this.setState({ showConfirmDelete: false }, this.deleteNow)}>Aceptar</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* Modals */}
                <ActionSheet
                    ref={this.actionSheet}
                    userInterfaceStyle={'light'}
                    title={'¿Qué desea editar?'}
                    options={this.optionsMenuEdit}
                    cancelButtonIndex={3}
                    destructiveButtonIndex={3}
                    onPress={this.selectEditOptions}
                />
                <ViewDirective ref={this.refViewDirective} openImage={this.openImageViewer} />
                <ImageViewer ref={this.refImageViewer} />
                <AddDirective ref={this.refAddDirective} showSnackbar={this.showSnackbar} />
                <EditDirective ref={this.refEditDirective} showSnackbar={this.showSnackbar} />
                <ChangePasswordDirective ref={this.refChangePasswordDirective} showSnackbar={this.showSnackbar} />
                <ChangePermissionDirective ref={this.refChangePermissionDirective} showSnackbar={this.showSnackbar} />
                <LoadingController visible={this.state.showLoading} loadingText={this.state.textLoading} indicatorColor={Theme.colors.accent} />
            </PaperProvider>
        </View>);
    }
}

const styles = StyleSheet.create({
    optionAction: {
        fontSize: 16,
        fontWeight: '600',
        color: '#41a5ee'
    }
});