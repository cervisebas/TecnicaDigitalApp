import { decode, encode } from "base-64";
import React, { Component, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, ToastAndroid, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Dialog, Divider, IconButton, Menu, Paragraph, Portal, Provider as PaperProvider, Snackbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ImageView from "react-native-image-viewing";
import messaging from '@react-native-firebase/messaging';
import CustomCard from "../Components/Elements/CustomCard";
import LoadingController from "../Components/loading/loading-controller";
import AddNewGroupAssist from "../Pages/AddNewGroupAssist";
import ConfirmAssist from "../Pages/ConfirmAssist";
import ViewAssist from "../Pages/ViewAssist";
import { Assist, Prefences } from "../Scripts/ApiTecnica";
import { AnnotationList, AssistUserData, DataGroup } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import AddAnnotationAssist from "../Pages/AddAnnotationAssist";
import ViewAnnotations from "../Pages/ViewAnnotations";
import ConfigurePreferences from "../Pages/ConfigurePreferences";
import moment from "moment";
import SearchGroups from "../Pages/SearchGroups";
import SearchGroupsResult from "../Pages/SearchGroupsResult";

type IProps = {
    navigation: any;
};
type IState = {
    //List
    dataGroups: DataGroup[];
    isLoading: boolean;
    isError: boolean;
    isRefresh: boolean;
    messageError: string;
    // Interfaz
    confirmView: boolean;
    confirmData: AssistUserData[];
    confirmSelect: {
        id: string;
        curse: string;
    } | undefined;

    addNewGroup: boolean;

    assistView: boolean;
    assistData: AssistUserData[];
    assistSelect: {
        id: string;
        curse: string;
        date: string;
        hour: string;
        annotations: number;
    } | undefined;

    imageVisible: boolean;
    imageSource: string | undefined;
    imageText: string;

    visibleAddNewGroup: boolean;
    visibleConfigurePreferences: boolean;
    // Search
    visibleSearch: boolean;
    visibleSearchResult: boolean;
    dataSearch: DataGroup[];
    // Snackbar
    snackBarView: boolean;
    snackBarText: string;
    // LoadingController
    showLoading: boolean;
    textLoading: string;
    // Add Annotation
    visibleAddAnnotationAssist: boolean;
    // Add Annotation
    visibleViewAnnotations: boolean;
    dataViewAnnotations: AnnotationList[];
};

export default class Page1 extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            dataGroups: [],
            isLoading: false,
            isError: false,
            isRefresh: false,
            messageError: '',
            confirmView: false,
            confirmData: [],
            confirmSelect: undefined,
            addNewGroup: false,
            assistView: false,
            assistData: [],
            assistSelect: undefined,
            imageVisible: false,
            imageSource: undefined,
            imageText: '',
            visibleAddNewGroup: false,
            visibleConfigurePreferences: false,
            visibleSearchResult: false,
            visibleSearch: false,
            dataSearch: [],
            snackBarView: false,
            snackBarText: '',
            showLoading: false,
            textLoading: '',
            visibleAddAnnotationAssist: false,
            visibleViewAnnotations: false,
            dataViewAnnotations: []
        };
        this.loadData = this.loadData.bind(this);
        this._renderItem = this._renderItem.bind(this);
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
    }
    private event: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private _isMount: boolean = false;
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
            Assist.getGroups()
                .then(async(v)=>{
                    messaging().subscribeToTopic("directives");
                    if (this._isMount) {
                        this.setState({ dataGroups: await this.filterData(v), isLoading: false, isRefresh: false });
                        if (code) this.reloadData(code, v);
                    }
                })
                .catch((err)=>(this._isMount)&&this.setState({ isLoading: false, isError: true, isRefresh: false, messageError: err.cause }))
        );
    }
    async filterData(data: DataGroup[]) {
        var prefences = await  Prefences.getAssist();
        if (prefences.length == 0) return data;
        return data.filter((v)=>!!prefences.find((v2)=>v2 == decode(v.curse)));
    }
    reloadData(code: number, newData: DataGroup[]) {
        switch (code) {
            case 1:
                if (!this.state.assistView) return;
                var f = newData.find((v)=>this.state.assistSelect?.id == v.id);
                if (f) this.setState({
                    assistSelect: {
                        id: f.id,
                        curse: decode(f.curse),
                        annotations: f.annotations,
                        date: decode(f.date),
                        hour: decode(f.hour)
                    }
                });
                break;
        }
    }
    createNewGroup(datas: { course: string; date: string; time: string; }, then?: ()=>any): Promise<string> {
        return new Promise((resolve)=>
            this.setState({ showLoading: true, textLoading: 'Creando grupo...' }, ()=>{
                (then)&&then();
                Assist.create(encode(datas.course), encode(datas.date), encode(datas.time))
                    .then((a)=>this.setState({ showLoading: false, snackBarView: true, snackBarText: 'Grupo creado correctamente.', isRefresh: true }, ()=>{ this.loadData(undefined, true); resolve(a); }))
                    .catch((error)=>this.setState({ showLoading: false, snackBarView: true, snackBarText: error.cause }));
            })
        );
    }
    openConfirm(idGroup: string, select: { id: string; curse: string; }) {
        this.setState({ showLoading: true, textLoading: 'Cargando información...' }, ()=>
            Assist.getGroup(idGroup)
                .then((a)=>this.setState({ showLoading: false, confirmView: true, confirmData: a, confirmSelect: select }))
                .catch((a)=>this.setState({ showLoading: false, snackBarView: true, snackBarText: a.cause }))
        );
    }
    openView(idGroup: string, select: { id: string; curse: string; date: string; hour: string; annotations: number; }) {
        this.setState({ showLoading: true, textLoading: 'Cargando información...' }, ()=>
            Assist.getGroup(idGroup)
                .then((a)=>this.setState({ showLoading: false, assistView: true, assistData: a, assistSelect: select }))
                .catch((a)=>this.setState({ showLoading: false, snackBarView: true, snackBarText: a.cause }))
        );
    }

    // Flatlist
    _keyExtractor({ id }: DataGroup) {
        return `p1-card-${id}`;
    }
    _openConfirm(id: string, curse: string) {
        this.openConfirm(id, { id: id, curse: decode(curse) });
    }
    _openView(id: string, curse: string, date: string, hour: string, annotations: number) {
        this.openView(id, { id: id, curse: decode(curse), date: decode(date), hour: decode(hour), annotations: annotations });
    }
    _renderItem({ item }: ListRenderItemInfo<DataGroup>) {
        return(<CustomCard
            key={`p1-card-${item.id}`}
            title={`Registro ${decode(item.curse)}`}
            date={`${decode(item.date)} (${decode(item.hour)}hs)`}
            state={(item.status == '0')? false: true}
            openConfirm={()=>this._openConfirm(item.id, item.curse)}
            openView={()=>this._openView(item.id, item.curse, item.date, item.hour, item.annotations)}
        />);
    }
    _getItemLayout(_data: DataGroup[] | null | undefined, index: number) {
        return {
            length: 125,
            offset: 125 * index,
            index
        };
    }

    // Global Functions
    _showLoading(visible: boolean, text: string, after?: ()=>any){
        this.setState({
            showLoading: visible,
            textLoading: text
        }, (after)&&after)
    }
    _openAddAnnotation() {
        this.setState({ visibleAddAnnotationAssist: true });
    }
    _openImage(source: string, text: string) {
        this.setState({
            imageVisible: true,
            imageSource: source,
            imageText: text
        });
    }
    _showSnackbar(visible: boolean, text: string, after?: ()=>any){
        this.setState({
            snackBarView: visible,
            snackBarText: text
        }, (after)&&after)
    }

    // New
    _openAddGroup() {
        if (Prefences.isIntoSyncHours()) return this.setState({ visibleAddNewGroup: true });
        this.setState({ addNewGroup: true });
    }
    _openConfigurePreferences() {
        this.setState({ visibleConfigurePreferences: true });
    }
    _openSearch() {
        this.setState({ visibleSearch: true });
    }
    _goSearch(dateSearch: Date) {
        this.setState({ showLoading: true, textLoading: 'Buscando...', visibleSearch: false }, ()=>{
            var date = moment(dateSearch).format('DD/MM/YYYY');
            var filter = this.state.dataGroups.filter((data)=>decode(data.date) == date);
            if (filter.length == 0) return this.setState({ visibleSearch: true, showLoading: false }, ()=>ToastAndroid.show('No se encontraron resultados', ToastAndroid.SHORT));
            setTimeout(()=>this.setState({ dataSearch: filter, showLoading: false, visibleSearchResult: true }), 1200);
        });
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar.Header>
                    <Appbar.Action icon="menu" onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Registros'}  />
                    <Appbar.Action icon={'plus'} disabled={this.state.isLoading || this.state.isError} onPress={this._openAddGroup} />
                    <MenuComponent
                        disable={this.state.isLoading || this.state.isError}
                        openPreferences={this._openConfigurePreferences}
                        openSearch={this._openSearch}
                    />
                </Appbar.Header>
                <View style={{ flex: 1, overflow: 'hidden' }}>
                    {(!this.state.isLoading)? (!this.state.isError)?
                    <FlatList
                        data={this.state.dataGroups}
                        extraData={this.state}
                        keyExtractor={this._keyExtractor}
                        getItemLayout={this._getItemLayout}
                        refreshControl={<RefreshControl colors={[Theme.colors.primary]} refreshing={this.state.isRefresh} onRefresh={()=>this.loadData(undefined, true)} />}
                        contentContainerStyle={{ flex: (this.state.dataGroups.length == 0)? 2: undefined, paddingTop: 8 }}
                        ListEmptyComponent={()=><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún registro</Text></View>}
                        renderItem={this._renderItem}
                    />:
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <Icon name={'account-alert-outline'} size={48} style={{ fontSize: 48 }} />
                            <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                            <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={()=>this.loadData()} style={{ marginTop: 12 }} />
                        </View>
                    </View>
                    :<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={'large'} animating /></View>}
                </View>
                <Snackbar
                    visible={this.state.snackBarView}
                    onDismiss={()=>this.setState({ snackBarView: false })}
                    action={{ label: 'OCULTAR', onPress: ()=>this.setState({ snackBarView: false }) }}>
                    <Text>{this.state.snackBarText}</Text>
                </Snackbar>
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
                            <Button onPress={()=>this.setState({ visibleAddNewGroup: false, addNewGroup: true })}>Proceder</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* ##### Modal's ##### */}
                <ImageView
                    images={(this.state.imageSource)? [{ uri: this.state.imageSource }]: []}
                    imageIndex={0}
                    visible={this.state.imageVisible}
                    onRequestClose={()=>this.setState({ imageVisible: false, imageSource: undefined, imageText: '' })}
                    FooterComponent={()=><View style={{ width: '100%', alignItems: 'center', marginBottom: 50 }}>
                        <Text style={{ color: '#FFFFFF' }}>{this.state.imageText}</Text>
                    </View>}
                />
                {(this.state.confirmView || this.state.assistView)&&<>
                    <AddAnnotationAssist
                        visible={this.state.visibleAddAnnotationAssist}
                        close={()=>this.setState({ visibleAddAnnotationAssist: false })}
                        idGroup={(this.state.confirmSelect)? this.state.confirmSelect.id: this.state.assistSelect!.id}
                    />
                </>}
                {(this.state.confirmSelect)&&<>
                    <ConfirmAssist
                        visible={this.state.confirmView}
                        close={()=>this.setState({ confirmView: false, confirmData: [], confirmSelect: undefined })}
                        select={this.state.confirmSelect}
                        data={this.state.confirmData}
                        showLoading={this._showLoading}
                        showSnackbar={this._showSnackbar}
                        openImage={this._openImage}
                        openAddAnnotation={this._openAddAnnotation}
                    />
                </>}
                {(this.state.assistSelect)&&<>
                    <ViewAssist
                        visible={this.state.assistView}
                        close={()=>this.setState({ assistView: false, assistData: [], assistSelect: undefined })}
                        select={this.state.assistSelect}
                        data={this.state.assistData}
                        editAssist={(id, select)=>{
                            this.openConfirm(id, select);
                            this.setState({ assistView: false, assistData: [], assistSelect: undefined });
                        }}
                        showSnackbar={this._showSnackbar}
                        showLoading={this._showLoading}
                        openAnnotations={(data)=>this.setState({ dataViewAnnotations: data, visibleViewAnnotations: true })}
                        openImage={this._openImage}
                        openAddAnnotation={this._openAddAnnotation}
                    />
                    <ViewAnnotations
                        visible={this.state.visibleViewAnnotations}
                        close={()=>this.setState({ visibleViewAnnotations: false, dataViewAnnotations: [] })}
                        select={this.state.assistSelect}
                        data={this.state.dataViewAnnotations}
                        goLoading={this._showLoading}
                    />
                </>}
                <AddNewGroupAssist
                    visible={this.state.addNewGroup}
                    close={()=>this.setState({ addNewGroup: false })}
                    createNow={(datas, then)=>this.createNewGroup(datas, ()=>(then)&&then())}
                    openConfirm={(a, d)=>this.openConfirm(a, d)}
                />
                <SearchGroups visible={this.state.visibleSearch} close={()=>this.setState({ visibleSearch: false })} goSearch={this._goSearch} />
                <SearchGroupsResult
                    visible={this.state.visibleSearchResult}
                    close={()=>this.setState({ visibleSearchResult: false, dataSearch: [] })}
                    datas={this.state.dataSearch}
                    openConfirm={this._openConfirm}
                    openView={this._openView}
                />
                <ConfigurePreferences visible={this.state.visibleConfigurePreferences} close={()=>this.setState({ visibleConfigurePreferences: false })} />
                <LoadingController visible={this.state.showLoading} loadingText={this.state.textLoading} indicatorColor={Theme.colors.accent} />
            </PaperProvider>
        </View>);
    }
}

type IProps2 = {
    disable: boolean;
    openPreferences: ()=>any;
    openSearch: ()=>any;
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
    render(): React.ReactNode {
        return(<Menu
            visible={this.state.isMenuOpen}
            onDismiss={this._close}
            anchor={<Appbar.Action color={'#FFFFFF'} disabled={this.props.disable} icon={'dots-vertical'} onPress={this._open} />}>
            <Menu.Item icon={'account-cog-outline'} title={"Preferencias"} onPress={this._openPreferences} />
            <Menu.Item icon={'archive-search-outline'} title={"Buscar registro"} onPress={this._openSearch} />
            <Divider />
            <Menu.Item icon={'close'} onPress={this._close} title={"Cerrar"} />
        </Menu>);
    }
}