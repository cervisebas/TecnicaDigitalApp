import React, { Component } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { Button, ActivityIndicator, Appbar, Dialog, Divider, IconButton, List, Paragraph, Portal, Provider as PaperProvider, Snackbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ImageView from "react-native-image-viewing";
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

type IProps = {
    navigation: any;
};
type IState = {
    isLoading: boolean;
    isError: boolean;
    isRefresh: boolean;

    messageError: string;
    datas: DirectivesList[];

    visibleViewDirective: boolean;
    dataViewDirective: DirectivesList | undefined;

    visibleAddDirective: boolean;

    showLoading: boolean;
    textLoading: string;

    snackBarView: boolean;
    snackBarText: string;

    showViewer: boolean;

    idOptionSelect: string;

    visibleEditDirective: boolean;
    dataEditDirective: DirectivesList | undefined;
    
    visibleChangePassword: boolean;
    dataChangePassword: DirectivesList | undefined;
    
    visibleChangePermissions: boolean;
    dataChangePermissions: DirectivesList | undefined;

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
            visibleViewDirective: false,
            dataViewDirective: undefined,
            visibleAddDirective: false,
            showLoading: false,
            textLoading: '',
            snackBarView: false,
            snackBarText: '',
            showViewer: false,
            visibleEditDirective: false,
            dataEditDirective: undefined,
            idOptionSelect: '-1',
            visibleChangePassword: false,
            dataChangePassword: undefined,
            visibleChangePermissions: false,
            dataChangePermissions: undefined,
            showConfirmDelete: false
        };
        this._renderItem = this._renderItem.bind(this);
        this._ListFooterComponent = this._ListFooterComponent.bind(this);
        this.loadData = this.loadData.bind(this);
        this.selectEditOptions = this.selectEditOptions.bind(this);
        this.deleteNow = this.deleteNow.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    // Action Sheet
    private actionSheet: ActionSheet | null = null;
    private optionsMenuEdit: any[] = [
        <Text style={styles.optionAction}>Editar información</Text>,
        <Text style={styles.optionAction}>Cambiar contraseña</Text>,
        <Text style={styles.optionAction}>Cambiar permisos</Text>,
        'Cancelar'
    ];
    
    componentDidMount() {
        this.loadData();
        this.event = DeviceEventEmitter.addListener('reload-page4', this.loadData);
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
    _keyExtractor(item: DirectivesList) {
        return `directive-list-${item.id}`;
    }
    _getItemLayout(data: DirectivesList[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * data!.length,
            index
        };
    }
    _renderItem({ item }: ListRenderItemInfo<DirectivesList>) {
        return(<ItemDirective
            title={decode(item.name)}
            position={decode(item.position)}
            permission={parseInt(item.permission)}
            source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
            onPress={()=>this.setState({
                visibleViewDirective: true,
                dataViewDirective: item
            })}
            onEdit={()=>this.setState({ idOptionSelect: item.id }, ()=>this.actionSheet?.show())}
            onDelete={()=>this.setState({ idOptionSelect: item.id, showConfirmDelete: true })}
        />);
    }
    _ListFooterComponent() {
        return(<List.Item
            left={()=><List.Icon icon={'account-plus-outline'} />}
            title={'Añadir directivo'}
            onPress={()=>this.setState({ visibleAddDirective: true })}
            style={{ height: 70 }}
        />);
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    /* ###################### */

    deleteNow() {
        this.setState({ showLoading: true, textLoading: 'Eliminado directivo...' }, ()=>
            Directive.delete(this.state.idOptionSelect)
                .then(()=>{
                    this.loadData();
                    this.setState({ showLoading: false, snackBarView: true, snackBarText: 'El directivo se eliminó correctamente.' });
                })
                .catch((error)=>this.setState({ showLoading: false, snackBarView: true, snackBarText: error.cause }))
        );
    }

    selectEditOptions(opt: number) {
        switch (opt) {
            case 0:
                var data = this.state.datas.find((v)=>this.state.idOptionSelect == v.id);
                this.setState({ visibleEditDirective: true, dataEditDirective: data });
                break;
            case 1:
                var data = this.state.datas.find((v)=>this.state.idOptionSelect == v.id);
                this.setState({ visibleChangePassword: true, dataChangePassword: data });
                break;
            case 2:
                var data = this.state.datas.find((v)=>this.state.idOptionSelect == v.id);
                this.setState({ visibleChangePermissions: true, dataChangePermissions: data });
                break;
        }
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar>
                    <Appbar.Action icon="menu" onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Directivos'}  />
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
                        ListFooterComponent={this._ListFooterComponent}
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
                <Snackbar
                    visible={this.state.snackBarView}
                    onDismiss={()=>this.setState({ snackBarView: false })}
                    action={{ label: 'OCULTAR', onPress: ()=>this.setState({ snackBarView: false }) }}>
                    <Text>{this.state.snackBarText}</Text>
                </Snackbar>
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
                    ref={(ref)=>this.actionSheet = ref}
                    userInterfaceStyle={'light'}
                    title={'¿Qué desea editar?'}
                    options={this.optionsMenuEdit}
                    cancelButtonIndex={3}
                    destructiveButtonIndex={3}
                    onPress={this.selectEditOptions}
                />
                <ViewDirective
                    visible={this.state.visibleViewDirective}
                    close={()=>this.setState({ visibleViewDirective: false })}
                    data={this.state.dataViewDirective}
                    openImage={()=>this.setState({ showViewer: true })}
                />
                {(this.state.visibleViewDirective)&&<ImageView
                    images={[{ uri: `${urlBase}/image/${decode(this.state.dataViewDirective!.picture)}` }]}
                    imageIndex={0}
                    visible={this.state.showViewer}
                    swipeToCloseEnabled={true}
                    doubleTapToZoomEnabled={true}
                    onRequestClose={()=>this.setState({ showViewer: false })}
                />}
                <AddDirective
                    visible={this.state.visibleAddDirective}
                    close={()=>this.setState({ visibleAddDirective: false })}
                    showSnackbar={(v, t)=>this.setState({ snackBarView: v, snackBarText: t })}
                />
                <EditDirective
                    visible={this.state.visibleEditDirective}
                    close={()=>this.setState({ visibleEditDirective: false, dataEditDirective: undefined })}
                    data={this.state.dataEditDirective}
                    showSnackbar={(v, t)=>this.setState({ snackBarView: v, snackBarText: t })}
                />
                <ChangePasswordDirective
                    visible={this.state.visibleChangePassword}
                    close={()=>this.setState({ visibleChangePassword: false, dataChangePassword: undefined })}
                    data={this.state.dataChangePassword}
                    showSnackbar={(v, t)=>this.setState({ snackBarView: v, snackBarText: t })}
                />
                <ChangePermissionDirective
                    visible={this.state.visibleChangePermissions}
                    close={()=>this.setState({ visibleChangePermissions: false, dataChangePermissions: undefined })}
                    data={this.state.dataChangePermissions}
                    showSnackbar={(v, t)=>this.setState({ snackBarView: v, snackBarText: t })}
                />
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