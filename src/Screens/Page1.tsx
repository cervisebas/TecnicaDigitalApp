import { decode, encode } from "base-64";
import React, { Component, createRef, PureComponent } from "react";
import { DefaultSectionT, DeviceEventEmitter, EmitterSubscription, PermissionsAndroid, RefreshControl, SectionList, SectionListData, SectionListRenderItemInfo, StyleSheet, ToastAndroid, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Dialog, Divider, IconButton, Menu, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import messaging from '@react-native-firebase/messaging';
import CustomCard from "../Components/Elements/CustomCard";
import AddNewGroupAssist from "../Pages/AddNewGroupAssist";
import ConfirmAssist from "../Pages/ConfirmAssist";
import ViewAssist from "../Pages/ViewAssist";
import { Assist, Groups, Prefences } from "../Scripts/ApiTecnica";
import { AnnotationList, DataGroup, Groups as GroupsTypes } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import AddAnnotationAssist from "../Pages/AddAnnotationAssist";
import ViewAnnotations from "../Pages/ViewAnnotations";
import ConfigurePreferences from "../Pages/ConfigurePreferences";
import moment from "moment";
import SearchGroups from "../Pages/SearchGroups";
import SearchGroupsResult from "../Pages/SearchGroupsResult";
import ImageViewerText from "../Pages/ImageViewerText";
import LoadingComponent from "../Components/LoadingComponent";
import SetGroup from "../Pages/SetGroup";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import { ThemeContext } from "../Components/ThemeProvider";
import color from "color";
import { isTempSession } from "../Scripts/ApiTecnica/tempsession";
import GetExtendedRegist from "../Pages/GetExtendedRegist";
import generatePDFCurseMonth from "../Scripts/CreatePDFCurseMonth";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";

type IProps = {
    navigation: any;
};
type IState = {
    //List
    dataGroups: DataGroup[];
    dataGroups2: DataGroupForDate[];
    listGroups: GroupsTypes[];
    isLoading: boolean;
    isError: boolean;
    isRefresh: boolean;
    messageError: string;
    // Interfaz
    visibleAddNewGroup: boolean;
};
type DataGroupForDate = {
    title: string;
    data: DataGroup[];
};

export default class Page1 extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            dataGroups: [],
            dataGroups2: [],
            listGroups: [],
            isLoading: false,
            isError: false,
            isRefresh: false,
            messageError: '',
            visibleAddNewGroup: false
        };
        this.loadData = this.loadData.bind(this);
        this.openConfirm = this.openConfirm.bind(this);
        this.createNewGroup = this.createNewGroup.bind(this);
        this._showLoading = this._showLoading.bind(this);
        this._openAddAnnotation = this._openAddAnnotation.bind(this);
        this._openImage = this._openImage.bind(this);
        this._showSnackbar = this._showSnackbar.bind(this);
        this._openConfigurePreferences = this._openConfigurePreferences.bind(this);
        this._openAddGroup = this._openAddGroup.bind(this);
        this._openSearch = this._openSearch.bind(this);
        this._goSearch = this._goSearch.bind(this);
        this._openConfirm = this._openConfirm.bind(this);
        this._openView = this._openView.bind(this);
        this._openAnnotations = this._openAnnotations.bind(this);
        this._openSetGroup = this._openSetGroup.bind(this);
        this._setFilterConfirm = this._setFilterConfirm.bind(this);
        this._renderItem3 = this._renderItem3.bind(this);
        this._renderSectionHeader = this._renderSectionHeader.bind(this);
        this._openGenerateExtendedRegist = this._openGenerateExtendedRegist.bind(this);
        this._generateNowExtendedRegist = this._generateNowExtendedRegist.bind(this);
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private _isMount: boolean = false;
    static contextType = ThemeContext;
    // Refs Components
    private refImageViewerText= createRef<ImageViewerText>();
    private refAddAnnotationAssist= createRef<AddAnnotationAssist>();
    private refConfirmAssist= createRef<ConfirmAssist>();
    private refViewAssist= createRef<ViewAssist>();
    private refViewAnnotations= createRef<ViewAnnotations>();
    private refAddNewGroupAssist= createRef<AddNewGroupAssist>();
    private refSearchGroups= createRef<SearchGroups>();
    private refSearchGroupsResult= createRef<SearchGroupsResult>();
    private refConfigurePreferences= createRef<ConfigurePreferences>();
    private refLoadingComponent= createRef<LoadingComponent>();
    private refSetGroup= createRef<SetGroup>();
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refGetExtendedRegist = createRef<GetExtendedRegist>();

    componentDidMount() {
        this._isMount = true;
        this.loadData();
        this.event = DeviceEventEmitter.addListener('p1-reload', (number?: number | undefined, isRefresh?: boolean | undefined)=>this.setState({ isRefresh: !!isRefresh }, ()=>this.loadData(number, isRefresh)));
        this.event2 = DeviceEventEmitter.addListener('loadNowAll', this.loadData);
    }
    componentWillUnmount() {
        this._isMount = false;
        this.event?.remove();
        this.event2?.remove();
        this.event = null;
        this.event2 = null;
    }
    loadData(code?: number | undefined, isRefresh?: boolean): any {
        if (!this._isMount) return;
        (!isRefresh)&&this.setState({ dataGroups: [] });
        this.setState({ isLoading: !isRefresh, isError: false }, ()=>
            Groups.getAll().then((groups)=>
                Assist.getGroups()
                    .then(async(v)=>{
                        const isSessionTemp = await isTempSession();
                        if (!isSessionTemp) messaging().subscribeToTopic("directives");
                        if (this._isMount) {
                            const dataGroups = await this.filterData(v);
                            const noConfirm = dataGroups.filter((value)=>value.status !== '1').length;
                            this.setState({ dataGroups, dataGroups2: this.filterListForDate(dataGroups), listGroups: groups, isLoading: false, isRefresh: false });
                            DeviceEventEmitter.emit('update-regist-count', noConfirm);
                            if (code) this.reloadData(code, v);
                        }
                    })
                    .catch((err)=>(this._isMount)&&this.setState({ isLoading: false, isError: true, isRefresh: false, messageError: err.cause }))
            ).catch((err)=>(this._isMount)&&this.setState({ isLoading: false, isError: true, isRefresh: false, messageError: err.cause }))
        );
        //Assist.getAssistForMonth(encode('7°3'), 9, 2022).then((d)=>console.log(d)).catch((r)=>console.log(r));
    }
    filterListForDate(actual: DataGroup[]) {
        const newList: DataGroupForDate[] = [];
        actual.forEach((v1)=>{
            const findIndex = newList.findIndex((v0)=>v0.title == v1.date);
            if (findIndex !== -1) return newList[findIndex].data.push(v1);
            newList.push({
                title: v1.date,
                data: [v1]
            });
        });
        return newList;
    }
    async filterData(data: DataGroup[]) {
        var prefences = await Prefences.getAssist();
        if (prefences.length == 0) return data;
        return data.filter((v)=>!!prefences.find((v2)=>v2 == decode(v.curse)));
    }
    reloadData(code: number, newData: DataGroup[]) {
        switch (code) {
            case 1:
                if (!this.refViewAssist.current?.state.visible) return;
                var f = newData.find((v)=>this.refViewAssist.current?.state.select.id == v.id);
                if (f) this.refViewAssist.current.updateSelect({
                    id: f.id,
                    curse: decode(f.curse),
                    annotations: f.annotations,
                    date: decode(f.date),
                    hour: decode(f.hour)
                });
                break;
        }
    }
    createNewGroup(datas: { course: string; date: string; time: string; }, then?: ()=>any): Promise<string> {
        return new Promise((resolve)=>{
            this.refLoadingComponent.current?.open('Creando grupo...');
            (then)&&then();
            Assist.create(encode(datas.course), encode(datas.date), encode(datas.time))
                .then((a)=>{
                    this.refLoadingComponent.current?.close();
                    this.refCustomSnackbar.current?.open('Grupo creado correctamente.');
                    this.setState({ isRefresh: true }, ()=>{
                        this.loadData(undefined, true);
                        resolve(a);
                    });
                })
                .catch((error)=>{
                    this.refLoadingComponent.current?.close();
                    this.refCustomSnackbar.current?.open(error.cause);
                });
        });
    }
    openConfirm(idGroup: string, select: { id: string; curse: string; date: string; }) {
        this.refLoadingComponent.current?.open('Cargando información...');
        Assist.getGroup(idGroup)
            .then((a)=>{
                this.refLoadingComponent.current?.close();
                this.refConfirmAssist.current?.open(select, a);
            })
            .catch((error)=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }
    openView(idGroup: string, select: { id: string; curse: string; date: string; hour: string; annotations: number; }) {
        this.refLoadingComponent.current?.open('Cargando información...');
        Assist.getGroup(idGroup)
            .then((a)=>{
                this.refLoadingComponent.current?.close();
                this.refViewAssist.current?.open(select, a);
            })
            .catch((error)=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }

    _openConfirm(id: string, curse: string, date: string) {
        this.openConfirm(id, { id: id, curse: decode(curse), date: decode(date) });
    }
    _openView(id: string, curse: string, date: string, hour: string, annotations: number) {
        this.openView(id, { id: id, curse: decode(curse), date: decode(date), hour: decode(hour), annotations: annotations });
    }

    // SectionList
    _keyExtractor2({ id }: DataGroup) {
        return `p1-card-${id}`;
    }
    _getItemLayout2(_data: DataGroup[] | null | undefined, index: number) {
        return {
            length: 125,
            offset: 125 * index,
            index
        };
    }
    _renderItem3({ item }: SectionListRenderItemInfo<DataGroup, DefaultSectionT>) {
        return(<CustomCard
            key={`p1-card-${item.id}`}
            title={`Registro ${decode(item.curse)}`}
            date={`${decode(item.date)} (${decode(item.hour)}hs)`}
            annotations={item.annotations}
            state={(item.status == '0')? false: true}
            openConfirm={()=>this._openConfirm(item.id, item.curse, item.date)}
            openView={()=>this._openView(item.id, item.curse, item.date, item.hour, item.annotations)}
        />);
    }
    _renderSectionHeader({ section }: { section: SectionListData<DataGroup, DefaultSectionT>; }) {
        const { theme } = this.context;
        const title = moment(decode(section.title), 'DD/MM/YYYY').format('dddd, DD [de] MMMM [del] YYYY');
        const title_2 = title[0].toUpperCase()+title.substring(1);
        return(<Text
            numberOfLines={1}
            style={[styles.contentHead, { color: color(theme.colors.text).alpha(0.54).rgb().string() }, theme.fonts.medium]}
        >{title_2}</Text>);
    }
    // #######

    // Global Functions
    _showLoading(visible: boolean, text: string, after?: ()=>any){
        if (!visible) {
            this.refLoadingComponent.current?.close();
            return (after)&&after();
        }
        this.refLoadingComponent.current?.open(text);
        (after)&&after();
    }
    _openAddAnnotation() {
        var idGroup = (this.refConfirmAssist.current?.state.visible)? this.refConfirmAssist.current.state.select.id: this.refViewAssist.current!.state.select.id;
        this.refAddAnnotationAssist.current?.open(idGroup);
    }
    _openImage(source: string, text: string) {
        this.refImageViewerText.current?.open(source, text);
    }
    _showSnackbar(visible: boolean, text: string, after?: ()=>any){
        if (!visible) return this.refCustomSnackbar.current?.close();
        this.refCustomSnackbar.current?.open(text);
        (after)&&after();
    }

    // New
    _openAddGroup() {
        if (Prefences.isIntoSyncHours()) return this.setState({ visibleAddNewGroup: true });
        this.refAddNewGroupAssist.current?.open();
    }
    _openConfigurePreferences() {
        this.refConfigurePreferences.current?.open();
    }
    _openSearch() {
        this.refSearchGroups.current?.open();
    }
    _goSearch(dateSearch: Date) {
        this.refLoadingComponent.current?.open('Buscando...');
        var date = moment(dateSearch).format('DD/MM/YYYY');
        var filter = this.state.dataGroups.filter((data)=>decode(data.date) == date);
        if (filter.length == 0) {
            this.refSearchGroups.current?.open();
            this.refLoadingComponent.current?.close();
            return ToastAndroid.show('No se encontraron resultados', ToastAndroid.SHORT);
        }
        this.refLoadingComponent.current?.close();
        this.refSearchGroupsResult.current?.open(filter);
    }
    _openAnnotations(data: AnnotationList[]) {
        var select = this.refViewAssist.current!.state.select;
        this.refViewAnnotations.current?.open(select, data);
    }
    _openSetGroup() {
        const select = this.refConfirmAssist.current?.state.select;
        const list = this.state.listGroups.filter((v)=>decode(v.curse) == select?.curse);
        this.refSetGroup.current?.open(list, select!.curse);
    }
    _setFilterConfirm(filter: string[]) {
        this.refConfirmAssist.current?.setFilter(filter);
    }
    _openGenerateExtendedRegist() {
        this.refGetExtendedRegist.current?.open();
    }
    async _generateNowExtendedRegist(curse: string, month: number, age: number) {
        this.refLoadingComponent.current?.open('Obteniendo información...');

        const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
            title: "Atención",
            message: "Para guardar la imagen se necesita acceder al almacenamiento de su dispositivo, por favor acepte los permisos que se requieren.",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar"
        });
        if (permission == PermissionsAndroid.RESULTS.DENIED) {
            this.refLoadingComponent.current?.close();
            this.refGetExtendedRegist.current?.restaure(curse, month, age);
            return ToastAndroid.show('Se denegó el acceso al almacenamiento.', ToastAndroid.LONG);
        }

        Assist.getAssistForMonth(encode(curse), month, age)
            .then((data)=>{
                this.refLoadingComponent.current?.update('Generando archivo PDF...');
                generatePDFCurseMonth(data)
                    .then((uri)=>{
                        const listMonths = [{ index: 1, name: 'Enero'}, { index: 2, name: 'Febrero'}, { index: 3, name: 'Marzo'}, { index: 4, name: 'Abril'}, { index: 5, name: 'Mayo'}, { index: 6, name: 'Junio'}, { index: 7, name: 'Julio'}, { index: 8, name: 'Agosto'}, { index: 9, name: 'Septiembre'}, { index: 10, name: 'Octubre'}, { index: 11, name: 'Noviembre'}, { index: 12, name: 'Diciembre'}];
                        const nameMonth = listMonths.find((v)=>v.index == parseInt(data.month))?.name;
                        const nameFile = `registros-${data.curse.replace('°', '-')}-${nameMonth?.toLowerCase()}`;
                        RNFS.copyFile(uri, `${RNFS.DownloadDirectoryPath}/${nameFile}.pdf`)
                            .then(()=>ToastAndroid.show('El archivo se copio correctamente en la carpeta de descargas', ToastAndroid.SHORT))
                            .catch(()=>ToastAndroid.show('Ocurrió un error al copiar el archivo a la carpeta de descargas', ToastAndroid.SHORT));
                        FileViewer.open(uri, { showOpenWithDialog: true, showAppsSuggestions: true })
                            .catch(()=>this.refCustomSnackbar.current?.open('Ocurrió un problema al abrir el archivo generado.'));
                        this.refLoadingComponent.current?.close();
                    })
                    .catch(({ cause })=>{
                        this.refLoadingComponent.current?.close();
                        this.refGetExtendedRegist.current?.restaure(curse, month, age);
                        ToastAndroid.show(cause, ToastAndroid.LONG);
                    });
            })
            .catch(({ cause })=>{
                this.refLoadingComponent.current?.close();
                this.refGetExtendedRegist.current?.restaure(curse, month, age);
                ToastAndroid.show(cause, ToastAndroid.LONG);
            });
    }

    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={theme}>
                <Appbar.Header>
                    <Appbar.Action icon="menu" onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Registros'}  />
                    <Appbar.Action
                        icon={'plus'}
                        disabled={this.state.isLoading || this.state.isError}
                        onPress={this._openAddGroup}
                    />
                    <MenuComponent
                        disable={this.state.isLoading || this.state.isError}
                        openPreferences={this._openConfigurePreferences}
                        openSearch={this._openSearch}
                        openMultipleRegists={this._openGenerateExtendedRegist}
                    />
                </Appbar.Header>
                <View style={{ flex: 1, overflow: 'hidden' }}>
                    {(!this.state.isLoading)? (!this.state.isError)?
                    <SectionList
                        sections={this.state.dataGroups2}
                        extraData={this.state}
                        keyExtractor={this._keyExtractor2}
                        refreshControl={<RefreshControl colors={[Theme.colors.primary]} progressBackgroundColor={theme.colors.surface} refreshing={this.state.isRefresh} onRefresh={()=>this.loadData(undefined, true)} />}
                        contentContainerStyle={(this.state.dataGroups2.length == 0)? { flex: 2 }: undefined}
                        ListEmptyComponent={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} color={theme.colors.text} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún registro</Text></View>}
                        renderSectionHeader={this._renderSectionHeader}
                        renderItem={this._renderItem3}
                    />:
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <Icon name={'account-alert-outline'} size={48} color={theme.colors.text} style={{ fontSize: 48 }} />
                            <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                            <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={()=>this.loadData()} style={{ marginTop: 12 }} />
                        </View>
                    </View>
                    :<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={'large'} animating /></View>}
                </View>
                <CustomSnackbar ref={this.refCustomSnackbar} />
                <Portal>
                    <Dialog visible={this.state.visibleAddNewGroup} onDismiss={()=>this.setState({ visibleAddNewGroup: false })}>
                        <Dialog.Title>Advertencia</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>
                                {"Estas dentro de las horas en la que el sistema sincronizara los datos que recolecto de forma automática con las credenciales de los alumnos.\nSi creas un nuevo grupo correspondiente a las horas donde los alumnos de un curso ingresan con las credenciales esos datos no se sincronizarán. Si este es el caso no te preocupes dentro de poco tiempo aparecerá un grupo de forma automática con los datos de los alumnos ingresados.\nEn caso que desees añadir un grupo de un curso que no entre en estas horas proceda de manera segura."}
                            </Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={()=>this.setState({ visibleAddNewGroup: false })}>Cancelar</Button>
                            <Button onPress={()=>this.setState({ visibleAddNewGroup: false }, ()=>this.refAddNewGroupAssist.current?.open())}>Proceder</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* ##### Modal's ##### */}
                <ImageViewerText ref={this.refImageViewerText} />
                <AddAnnotationAssist ref={this.refAddAnnotationAssist} />
                <ConfirmAssist
                    ref={this.refConfirmAssist}
                    showLoading={this._showLoading}
                    showSnackbar={this._showSnackbar}
                    openImage={this._openImage}
                    openAddAnnotation={this._openAddAnnotation}
                    openSetGroup={this._openSetGroup}
                />
                <ViewAssist
                    ref={this.refViewAssist}
                    editAssist={this.openConfirm}
                    showSnackbar={this._showSnackbar}
                    showLoading={this._showLoading}
                    openAnnotations={this._openAnnotations}
                    openImage={this._openImage}
                    openAddAnnotation={this._openAddAnnotation}
                />
                <ViewAnnotations
                    ref={this.refViewAnnotations}
                    goLoading={this._showLoading}
                />
                <AddNewGroupAssist
                    ref={this.refAddNewGroupAssist}
                    createNow={this.createNewGroup}
                    openConfirm={this.openConfirm}
                />
                <SearchGroups ref={this.refSearchGroups} goSearch={this._goSearch} />
                <SearchGroupsResult
                    ref={this.refSearchGroupsResult}
                    openConfirm={this._openConfirm}
                    openView={this._openView}
                />
                <ConfigurePreferences ref={this.refConfigurePreferences} />
                <SetGroup ref={this.refSetGroup} setFilter={this._setFilterConfirm} />
                <GetExtendedRegist ref={this.refGetExtendedRegist} generateNow={this._generateNowExtendedRegist} />
                <LoadingComponent ref={this.refLoadingComponent} />
            </PaperProvider>
        </View>);
    }
}

type IProps2 = {
    disable: boolean;
    openPreferences: ()=>any;
    openSearch: ()=>any;
    openMultipleRegists?: ()=>any;
};
type IState2 = {
    isMenuOpen: boolean;
};
class MenuComponent extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            isMenuOpen: false
        };
        this._close = this._close.bind(this);
        this._open = this._open.bind(this);
        this._openPreferences = this._openPreferences.bind(this);
        this._openSearch = this._openSearch.bind(this);
        this._openMultipleRegists = this._openMultipleRegists.bind(this);
    }
    _close() {
        this.setState({ isMenuOpen: false });
    }
    _open() {
        this.setState({ isMenuOpen: true });
    }
    _openPreferences() {
        this._close();
        this.props.openPreferences();
    }
    _openSearch() {
        this._close();
        this.props.openSearch();
    }
    _openMultipleRegists() {
        this._close();
        (this.props.openMultipleRegists)&&this.props.openMultipleRegists();
    }
    render(): React.ReactNode {
        return(<Menu
            visible={this.state.isMenuOpen}
            onDismiss={this._close}
            anchor={<Appbar.Action
                color={'#FFFFFF'}
                disabled={this.props.disable}
                icon={'dots-vertical'}
                onPress={this._open}
            />}>
            <Menu.Item icon={'account-cog-outline'} title={"Preferencias"} onPress={this._openPreferences} />
            <Menu.Item icon={'archive-search-outline'} title={"Buscar registro"} onPress={this._openSearch} />
            <Menu.Item icon={'file-document-multiple-outline'} title={"Obtener registro extendido"} onPress={this._openMultipleRegists} />
            <Divider />
            <Menu.Item icon={'close'} onPress={this._close} title={"Cerrar"} />
        </Menu>);
    }
}

const styles = StyleSheet.create({
    titleList: {
        fontSize: 14
    },
    contentHead: {
        paddingHorizontal: 16,
        paddingVertical: 13
    }
});