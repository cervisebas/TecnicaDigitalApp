import React, { Component, createRef, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, ToastAndroid, View } from "react-native";
import { Button, ActivityIndicator, Appbar, Dialog, Divider, IconButton, Paragraph, Portal, Provider as PaperProvider, Text, overlay } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import { DirectivesList } from "../Scripts/ApiTecnica/types";
import Theme, { ThemeDark } from "../Themes";
import { Directive, urlBase } from "../Scripts/ApiTecnica";
import ItemDirective from "../Components/Elements/CustomItem2";
import { decode, encode } from "base-64";
import ViewDirective from "../Pages/ViewDirective";
import AddDirective from "../Pages/AddDirective";
import EditDirective from "../Pages/EditDirective";
import ChangePasswordDirective from "../Pages/ChangePasswordDirective";
import ChangePermissionDirective from "../Pages/ChangePermissionDirective";
import ImageViewer from "../Pages/ImageViewer";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import { ThemeContext } from "../Components/ThemeProvider";
import LoadingComponent from "../Components/LoadingComponent";
import SelectOriginImage from "../Components/SelectOriginImage";
import ImageCropPicker, { Image as TypeImageCrop, Options } from "react-native-image-crop-picker";

type IProps = {
    navigation: any;
};
type IState = {
    isLoading: boolean;
    isError: boolean;
    isRefresh: boolean;
    messageError: string;
    datas: DirectivesList[];
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
            showConfirmDelete: false
        };
        this._renderItem = this._renderItem.bind(this);
        this.loadData = this.loadData.bind(this);
        this.selectEditOptions = this.selectEditOptions.bind(this);
        this.deleteNow = this.deleteNow.bind(this);
        this.openImageViewer = this.openImageViewer.bind(this);
        this.showSnackbar = this.showSnackbar.bind(this);
        this._openAddDirective = this._openAddDirective.bind(this);
        this.actionSetPicture = this.actionSetPicture.bind(this);
        this.changeImage2 = this.changeImage2.bind(this);
        this.goSendImage = this.goSendImage.bind(this);
        this.removePicture = this.removePicture.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private optionsMenuEdit: any[] = [
        <Text style={styles.optionAction}>Editar información</Text>,
        <Text style={styles.optionAction}>Cambiar contraseña</Text>,
        <Text style={styles.optionAction}>Cambiar permisos</Text>,
        <Text style={styles.optionAction}>Cambiar imagen</Text>,
        'Cancelar'
    ];
    private idOptionSelect: string = '-1';
    private creators: number[] = [1, 5, 10, 14, 23];
    static contextType = ThemeContext;
    private defaultOptions: Options = {
        cropping: true,
        compressImageQuality: 1,
        multiple: false,
        mediaType: 'photo',
        cropperStatusBarColor: '#FF3232',
        cropperActiveWidgetColor: '#FF3232',
        cropperToolbarColor: '#FF3232',
        cropperToolbarWidgetColor: '#FFFFFF',
        cropperToolbarTitle: 'Editar imagen',
        writeTempFile: true,
        includeBase64: false,
        includeExif: false,
        compressImageMaxWidth: 512,
        compressImageMaxHeight: 512
    };
    private defaultOptionsDark = {
        ...this.defaultOptions,
        cropperStatusBarColor: '#1D1D1D',
        cropperToolbarColor: overlay(4, ThemeDark.colors.surface),
    };
    private imageSelected: { uri: string; type: string; name: string; } = { uri: '', type: '', name: '' };
    // Refs    
    private actionSheet = createRef<ActionSheet>();
    private refViewDirective = createRef<ViewDirective>();
    private refImageViewer = createRef<ImageViewer>();
    private refAddDirective = createRef<AddDirective>();
    private refEditDirective = createRef<EditDirective>();
    private refChangePasswordDirective = createRef<ChangePasswordDirective>();
    private refChangePermissionDirective = createRef<ChangePermissionDirective>();
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refYouNotDidDelete = createRef<YouNotDidDelete>();
    private refLoadingComponent = createRef<LoadingComponent>();
    private refSelectOriginImage = createRef<SelectOriginImage>();
    private refVerifySendImage = createRef<VerifySendImage>();
    private refVerifyRemoveImage = createRef<VerifyRemoveImage>();


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
            isCreator={!!this.creators.find((v)=>v.toString() == item.id)}
            onPress={()=>this.refViewDirective.current?.open(item)}
            onEdit={()=>{
                this.idOptionSelect = item.id;
                this.actionSheet.current?.show();
            }}
            onNotDelete={()=>this.refYouNotDidDelete.current?.open()}
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
        this.refLoadingComponent.current?.open('Eliminado directivo...');
        Directive.delete(this.idOptionSelect)
            .then(()=>{
                this.refCustomSnackbar.current?.open('El directivo se eliminó correctamente.');
                this.refLoadingComponent.current?.close();
                this.setState({ isRefresh: true }, this.loadData);
            })
            .catch((error)=>{
                this.refCustomSnackbar.current?.open(error.cause);
                this.refLoadingComponent.current?.close();
            });
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
            case 3:
                this.refSelectOriginImage.current?.open();
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


    // Change Image Directive
    actionSetPicture(index: number) {
        const { isDark } = this.context;
        if (index == 0) ImageCropPicker.openCamera((isDark)? this.defaultOptionsDark: this.defaultOptions).then(this.changeImage2);
        if (index == 1) ImageCropPicker.openPicker((isDark)? this.defaultOptionsDark: this.defaultOptions).then(this.changeImage2);
        if (index == 2) {
            if (this.verifyRemoveImageDirective()) return this.refCustomSnackbar.current?.open('El perfil del directivo ya no cuenta con una imagen.');
            this.refVerifyRemoveImage.current?.open();
        }
    }
    verifyRemoveImageDirective() {
        const data = this.state.datas.find((v)=>v.id == this.idOptionSelect);
        if (data?.picture == encode('default-admin.png')) return true;
        return false;
    }
    changeImage2({ mime, path }: TypeImageCrop) {
        const filename = path.replace(/^.*[\\\/]/, '');
        var verify = (filename!.indexOf('.png') !== -1) || (filename!.indexOf('.jpg') !== -1) || (filename!.indexOf('.jpeg') !== -1) || (filename!.indexOf('.webp') !== -1);
        if (!verify) return ToastAndroid.show('La extensión de la imagen no es válida.', ToastAndroid.SHORT);
        this.imageSelected = {
            uri: path,
            type: mime,
            name: filename
        };
        this.refVerifySendImage.current?.open();
    }
    goSendImage() {
        this.refLoadingComponent.current?.open(`Aplicando imagen de perfil...`);
        Directive.editImage(this.idOptionSelect, this.imageSelected)
            .then(()=>{
                this.setState({ isRefresh: true }, this.loadData);
                this.refCustomSnackbar.current?.open('Se aplico la imagen correctamente.');
                this.refLoadingComponent.current?.close();
                this.verifyUpdateData();
            })
            .catch(({ cause })=>{
                this.refCustomSnackbar.current?.open(cause);
                this.refLoadingComponent.current?.close();
            });
    }
    removePicture() {
        this.refLoadingComponent.current?.open(`Quitando imagen de perfil...`);
        Directive.editImage(this.idOptionSelect, undefined, true)
            .then(()=>{
                this.setState({ isRefresh: true }, this.loadData);
                this.refCustomSnackbar.current?.open('Se quito la imagen correctamente.');
                this.refLoadingComponent.current?.close();
                this.verifyUpdateData();
            })
            .catch(({ cause })=>{
                this.refCustomSnackbar.current?.open(cause);
                this.refLoadingComponent.current?.close();
            });
    }
    async verifyUpdateData() {
        try {
            const datauser = await Directive.getDataLocal();
            if (this.idOptionSelect == datauser.id) {
                await Directive.verify();
                DeviceEventEmitter.emit('reloadDrawer');
            }
        } catch (error) {
            var cause = 'Ocurrió un error al actualizar los datos.';
            if ((error as any).cause) cause = (error as any).cause;
            ToastAndroid.show(cause, ToastAndroid.LONG);
        }
    }


    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={theme}>
                <Appbar>
                    <Appbar.Action icon={'menu'} onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Directivos'}  />
                    <Appbar.Action icon={'account-plus-outline'} disabled={this.state.isLoading || this.state.isError} onPress={this._openAddDirective} />
                </Appbar>
                <View style={{ flex: 2, overflow: 'hidden' }}>
                    {(!this.state.isLoading && !this.state.isError)? <FlatList
                        data={this.state.datas}
                        extraData={this.state}
                        contentContainerStyle={{ paddingTop: 8 }}
                        refreshControl={<RefreshControl
                            refreshing={this.state.isRefresh}
                            colors={[Theme.colors.primary]}
                            progressBackgroundColor={theme.colors.surface}
                            onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)}
                        />}
                        ItemSeparatorComponent={this._ItemSeparatorComponent}
                        getItemLayout={this._getItemLayout}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />:
                    <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                        {(!this.state.isError)? <ActivityIndicator size={'large'} animating />:
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                                <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} color={theme.colors.text} />
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
                    <YouNotDidDelete ref={this.refYouNotDidDelete} />
                    <VerifySendImage ref={this.refVerifySendImage} goSendImage={this.goSendImage} />
                    <VerifyRemoveImage ref={this.refVerifyRemoveImage} goRemoveImage={this.removePicture} />
                </Portal>

                {/* Modals */}
                <ActionSheet
                    ref={this.actionSheet}
                    userInterfaceStyle={(isDark)? 'dark': 'light'}
                    title={'¿Qué desea editar?'}
                    options={this.optionsMenuEdit}
                    cancelButtonIndex={4}
                    destructiveButtonIndex={4}
                    onPress={this.selectEditOptions}
                />
                <ViewDirective ref={this.refViewDirective} openImage={this.openImageViewer} />
                <ImageViewer ref={this.refImageViewer} />
                <AddDirective ref={this.refAddDirective} showSnackbar={this.showSnackbar} />
                <EditDirective ref={this.refEditDirective} showSnackbar={this.showSnackbar} />
                <ChangePasswordDirective ref={this.refChangePasswordDirective} showSnackbar={this.showSnackbar} />
                <ChangePermissionDirective ref={this.refChangePermissionDirective} showSnackbar={this.showSnackbar} />
                <SelectOriginImage ref={this.refSelectOriginImage} onAction={this.actionSetPicture} />
                <LoadingComponent ref={this.refLoadingComponent} />
            </PaperProvider>
        </View>);
    }
}

type IProps2 = {};
type IState2 = {
    visible: boolean;
};
class YouNotDidDelete extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            visible: false
        };
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
    }
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    render(): React.ReactNode {
        return(<Dialog visible={this.state.visible} onDismiss={this.close}>
            <Dialog.Title>No puedes borrar a un creador</Dialog.Title>
            <Dialog.Content>
                <Paragraph>Nosotros deseamos ver el futuro de este sitio así que deshabilitamos esta opción para nosotros, esperemos que lo entiendas.</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={this.close}>Cerrar</Button>
            </Dialog.Actions>
        </Dialog>);
    }
}

type IProps3 = { goSendImage: ()=>void; };
class VerifySendImage extends PureComponent<IProps3, IState2> {
    constructor(props: IProps3) {
        super(props);
        this.state = {
            visible: false
        };
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.goAction = this.goAction.bind(this);
    }
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    goAction() {
        this.close();
        this.props.goSendImage();
    }
    render(): React.ReactNode {
        return(<Dialog visible={this.state.visible} onDismiss={this.close}>
            <Dialog.Title>¡¡¡Atención!!!</Dialog.Title>
            <Dialog.Content>
                <Paragraph>{"¿Estás seguro que quieres cambiar la imagen del perfil del directivo seleccionado?\n\nEsta acción no se podrá deshacer, en caso que quieras retornar la imagen a una anterior tendrás que remplazar la imagen futura utilizando el archivo correspondiente."}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={this.close}>Cancelar</Button>
                <Button onPress={this.goAction}>Aceptar</Button>
            </Dialog.Actions>
        </Dialog>);
    }
}

type IProps4 = { goRemoveImage: ()=>void; };
class VerifyRemoveImage extends PureComponent<IProps4, IState2> {
    constructor(props: IProps4) {
        super(props);
        this.state = {
            visible: false
        };
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.goAction = this.goAction.bind(this);
    }
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    goAction() {
        this.close();
        this.props.goRemoveImage();
    }
    render(): React.ReactNode {
        return(<Dialog visible={this.state.visible} onDismiss={this.close}>
            <Dialog.Title>¡¡¡Atención!!!</Dialog.Title>
            <Dialog.Content>
                <Paragraph>{"¿Estás seguro que quieres remover la imagen del perfil del directivo seleccionado?\n\nEsta acción no se podrá deshacer, en caso que quieras retornar la imagen a una anterior tendrás que remplazar la imagen futura utilizando el archivo correspondiente."}</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={this.close}>Cancelar</Button>
                <Button onPress={this.goAction}>Aceptar</Button>
            </Dialog.Actions>
        </Dialog>);
    }
}

const styles = StyleSheet.create({
    optionAction: {
        fontSize: 16,
        fontWeight: '600',
        color: '#41a5ee'
    }
});