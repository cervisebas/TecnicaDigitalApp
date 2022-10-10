import React, { createRef, PureComponent } from "react";
import { Dimensions, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Button, Dialog, IconButton, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import { SketchCanvas } from "rn-perfect-sketch-canvas";
import { SketchCanvasRef } from "rn-perfect-sketch-canvas/src/components";
import { ThemeContext } from "../Components/ThemeProvider";
import RNFS from "react-native-fs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomCard5 from "../Components/Elements/CustomCard5";
import { DataGroup } from "../Scripts/ApiTecnica/types";
import { Assist } from "../Scripts/ApiTecnica";
import { decode, encode } from "base-64";
import LoadingComponent from "../Components/LoadingComponent";
import moment from "moment";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import ConfirmAssistTeacher from "../Pages/ConfirmAssistTeacher";
import { InWorking } from "../Components/InWorking";

type IProps = {
    navigation: any;
};
type IState = {
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;

    datas: DataGroup[];
};

export default class Page7 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: false,
            isRefresh: false,
            isError: false,
            messageError: '',
            datas: []
        };
        this.loadData = this.loadData.bind(this);
        this._openCreateRegist = this._openCreateRegist.bind(this);
        this.createRegist = this.createRegist.bind(this);
        this._renderItem = this._renderItem.bind(this);
    }
    static contextType = ThemeContext;
    // Ref's
    private refDialogCreate = createRef<DialogCreate>();
    private refLoadingComponent = createRef<LoadingComponent>();
    private refCustomSnackbar = createRef<CustomSnackbar>();
    private refConfirmAssistTeacher = createRef<ConfirmAssistTeacher>();
    /*private refSketchCanvas = createRef<SketchCanvasRef>();
    async convertToImage() {
        const base64 = this.refSketchCanvas.current?.toImage()?.encodeToBase64();
        const filePath = `${RNFS.ExternalCachesDirectoryPath}/assist-${this.getRandomInt(111111, 999999)}-confirm.png`;
        await RNFS.writeFile(filePath, base64!, 'base64');
        console.log(filePath);
        //console.log(this.refSketchCanvas.current?.toBase64(ImageFormat.WEBP, 70));
    }
    private getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }
    <SketchCanvas
        ref={this.refSketchCanvas}
        strokeWidth={8}
        strokeColor={'#000000'}
        containerStyle={styles.canvas}
    />
    */
    componentDidMount(): void {
        this.loadData();
    }
    loadData() {
        if (!this.state.isRefresh) this.setState({ isLoading: true, datas: [] });
        this.setState({ isError: false }, ()=>
            Assist.getGroupsTeachers()
                .then((datas)=>this.setState({ isLoading: false, isRefresh: false, datas }))
                .catch((error)=>this.setState({ isLoading: false, isError: true, messageError: error.cause }))
        );
    }
    createRegist() {
        this.refLoadingComponent.current?.open('Creando nuevo registro');
        Assist.create(encode('docentes'), encode(moment().format('DD/MM/YYYY')), encode(moment().format('HH:mm')))
            .then((id)=>{
                this.refCustomSnackbar.current?.open('El registro se creó correctamente.');
                this.refLoadingComponent.current?.close();
                this.setState({ isRefresh: true }, this.loadData);
            })
            .catch((error)=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }
    openRegist(idGroup: string) {
        this.refLoadingComponent.current?.open('Cargando información...');
        Assist.getGroup(idGroup)
            .then((data)=>{
                this.refLoadingComponent.current?.close();
                this.refConfirmAssistTeacher.current?.open(idGroup, data);
            })
            .catch((error)=>{
                this.refLoadingComponent.current?.close();
                this.refCustomSnackbar.current?.open(error.cause);
            });
    }
    
    _openCreateRegist() {
        this.refDialogCreate.current?.open();
    }
    // Flatlist
    _renderItem({ item }: ListRenderItemInfo<DataGroup>) {
        return(<CustomCard5
            key={`card-teacher-${item.id}`}
            title={`Registro ${item.id}`}
            date={decode(item.date)}
            hour={decode(item.hour)}
            openView={()=>this.openRegist(item.id)}
        />);
    }
    _getItemLayout(_data: DataGroup[] | null | undefined, index: number) {
        return {
            length: 125,
            offset: 125 * index,
            index
        };
    }
    _keyExtractor(item: DataGroup, _index: number) {
        return `card-teacher-${item.id}`;
    }
    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={theme}>
                <Appbar.Header>
                    <Appbar.Action icon={'menu'} onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Registros de docentes'} />
                    <Appbar.Action disabled icon={'plus'} onPress={this._openCreateRegist} />
                </Appbar.Header>
                <View style={styles.content}>
                    <InWorking />
                </View>
                {/*<>
                <View style={styles.content}>
                    {(!this.state.isLoading)? (!this.state.isError)?
                    <FlatList
                        data={this.state.datas}
                        keyExtractor={this._keyExtractor}
                        refreshControl={<RefreshControl colors={[theme.colors.primary]} progressBackgroundColor={theme.colors.surface} refreshing={this.state.isRefresh} onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)} />}
                        contentContainerStyle={{
                            paddingTop: 12,
                            flex: (this.state.datas.length == 0)? 2: undefined
                        }}
                        ListEmptyComponent={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} color={theme.colors.text} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún registro</Text></View>}
                        getItemLayout={this._getItemLayout}
                        renderItem={this._renderItem}
                    />:
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <Icon name={'account-alert-outline'} size={48} color={theme.colors.text} style={{ fontSize: 48 }} />
                            <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                            <IconButton icon={'reload'} color={theme.colors.primary} size={28} onPress={()=>this.loadData()} style={{ marginTop: 12 }} />
                        </View>
                    </View>
                    :<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={'large'} animating /></View>}
                </View>
                <DialogCreate ref={this.refDialogCreate} goCreateRegist={this.createRegist} />
                <CustomSnackbar ref={this.refCustomSnackbar} />

                <LoadingComponent ref={this.refLoadingComponent} />
                <ConfirmAssistTeacher ref={this.refConfirmAssistTeacher} showLoading={function (v: boolean, t: string, a?: (() => any) | undefined) {
                    throw new Error("Function not implemented.");
                } } showSnackbar={function (v: boolean, t: string, a?: (() => any) | undefined) {
                    throw new Error("Function not implemented.");
                } } openImage={function (source: string, text: string) {
                    throw new Error("Function not implemented.");
                } } openAddAnnotation={function () {
                    throw new Error("Function not implemented.");
                } } openSetGroup={function () {
                    throw new Error("Function not implemented.");
                } } />
                </>*/}
            </PaperProvider>
        </View>);
    }
}

type IProps2 = {
    goCreateRegist?: ()=>any;
};
type IState2 = {
    visible: boolean;
};
class DialogCreate extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            visible: false
        };
        this.goCreate = this.goCreate.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
    }
    goCreate() {
        this.close();
        (this.props.goCreateRegist)&&this.props.goCreateRegist();
    }
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }
    render(): React.ReactNode {
        return(<Portal>
            <Dialog visible={this.state.visible} onDismiss={this.close}>
                <Dialog.Title>¿Estas seguro/a que quieres crear un registro?</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>Los registros son creados de forma automática, si deseas proseguir y crearlo de forma manual presiona "Aceptar" de lo contrario cancela la operación.</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={this.close}>Cancelar</Button>
                    <Button onPress={this.goCreate}>Aceptar</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        overflow: 'hidden'
    }
});