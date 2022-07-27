import { decode, encode } from "base-64";
import React, { Component } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, View } from "react-native";
import { ActivityIndicator, Appbar, IconButton, Provider as PaperProvider, Snackbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ImageView from "react-native-image-viewing";
import CustomCard from "../Components/Elements/CustomCard";
import LoadingController from "../Components/loading/loading-controller";
import AddNewGroupAssist from "../Pages/AddNewGroupAssist";
import ConfirmAssist from "../Pages/ConfirmAssist";
import ViewAssist from "../Pages/ViewAssist";
import { Assist } from "../Scripts/ApiTecnica";
import { AnnotationList, AssistUserData, DataGroup } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import AddAnnotationAssist from "../Pages/AddAnnotationAssist";
import ViewAnnotations from "../Pages/ViewAnnotations";

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
                .then((v)=>{
                    if (this._isMount) {
                        this.setState({ dataGroups: v, isLoading: false, isRefresh: false });
                        if (code) this.reloadData(code, v);
                    }
                })
                .catch((err)=>(this._isMount)&&this.setState({ isLoading: false, isError: true, isRefresh: false, messageError: err.cause }))
        );
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
    _keyExtractor(item: DataGroup) {
        return `p1-card-${item.id}`;
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
            openView={()=>this._openView(item.id, item.curse, item.date, item.date, item.annotations)}
        />);
    }

    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar.Header>
                    <Appbar.Action icon="menu" onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Registros'}  />
                    <Appbar.Action icon={'plus'} disabled={this.state.isLoading || this.state.isError} onPress={()=>this.setState({ addNewGroup: true })} />
                </Appbar.Header>
                <View style={{ flex: 1, overflow: 'hidden' }}>
                    {(!this.state.isLoading)? (!this.state.isError)?
                    <FlatList
                        data={this.state.dataGroups}
                        extraData={this.state}
                        keyExtractor={this._keyExtractor}
                        refreshControl={<RefreshControl colors={[Theme.colors.primary]} refreshing={this.state.isRefresh} onRefresh={()=>this.loadData(undefined, true)} />}
                        contentContainerStyle={{ flex: (this.state.dataGroups.length == 0)? 2: undefined }}
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
                        showLoading={(v, t, a)=>this.setState({ showLoading: v, textLoading: t }, ()=>(a)&&a())}
                        showSnackbar={(v, t, a)=>this.setState({ snackBarView: v, snackBarText: t }, ()=>(a)&&a())}
                        openImage={(s, t)=>this.setState({ imageVisible: true, imageSource: s, imageText: t })}
                        openAddAnnotation={()=>this.setState({ visibleAddAnnotationAssist: true })}
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
                        showSnackbar={(v, t, a)=>this.setState({ snackBarView: v, snackBarText: t }, ()=>(a)&&a())}
                        showLoading={(v, t, a)=>this.setState({ showLoading: v, textLoading: t }, ()=>(a)&&a())}
                        openAnnotations={(data)=>this.setState({ dataViewAnnotations: data, visibleViewAnnotations: true })}
                        openImage={(s, t)=>this.setState({ imageVisible: true, imageSource: s, imageText: t })}
                        openAddAnnotation={()=>this.setState({ visibleAddAnnotationAssist: true })}
                    />
                    <ViewAnnotations
                        visible={this.state.visibleViewAnnotations}
                        close={()=>this.setState({ visibleViewAnnotations: false, dataViewAnnotations: [] })}
                        select={this.state.assistSelect}
                        data={this.state.dataViewAnnotations}
                        goLoading={(v, t, a)=>this.setState({ showLoading: v, textLoading: t }, ()=>(a)&&a())}
                    />
                </>}
                <AddNewGroupAssist
                    visible={this.state.addNewGroup}
                    close={()=>this.setState({ addNewGroup: false })}
                    createNow={(datas, then)=>this.createNewGroup(datas, ()=>(then)&&then())}
                    openConfirm={(a, d)=>this.openConfirm(a, d)}
                />
                <LoadingController visible={this.state.showLoading} loadingText={this.state.textLoading} indicatorColor={Theme.colors.accent} />
            </PaperProvider>
        </View>);
    }
}