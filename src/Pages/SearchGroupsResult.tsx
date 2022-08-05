import { decode } from "base-64";
import React, { Component, PureComponent } from "react";
import { Dimensions, FlatList, ListRenderItemInfo, PermissionsAndroid, StyleSheet, View } from "react-native";
import { Text, Appbar, ActivityIndicator } from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import RNFS from "react-native-fs";
import CustomCredential from "../Components/CustomCredential";
import CustomModal from "../Components/CustomModal";
import { urlBase } from "../Scripts/ApiTecnica";
import { DataGroup, StudentsData } from "../Scripts/ApiTecnica/types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Theme from "../Themes";
import CustomCard from "../Components/Elements/CustomCard";

type IProps = {
    visible: boolean;
    close: ()=>any;
    datas: DataGroup[];
    openConfirm: (id: string, curse: string)=>any;
    openView: (id: string, curse: string, date: string, hour: string, annotations: number)=>any;
};
type IState = {
    title: string;
};

const { width } = Dimensions.get('window');

export default class SearchGroupsResult extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            title: '00/00/0000'
        };
        this._renderItem = this._renderItem.bind(this);
        this.updateDataLocal = this.updateDataLocal.bind(this);
    }
    updateDataLocal() {
        if (this.props.datas.length == 0) return this.setState({ title: 'Sin resultados' });
        this.setState({ title: decode(this.props.datas[0].date) });
    }

    _keyExtractor({ id }: DataGroup) {
        return `p1-card-${id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<DataGroup>) {
        return(<CustomCard
            key={`p1-card-${item.id}`}
            title={`Registro ${decode(item.curse)}`}
            date={`${decode(item.date)} (${decode(item.hour)}hs)`}
            state={(item.status == '0')? false: true}
            openConfirm={()=>this.props.openConfirm(item.id, item.curse)}
            openView={()=>this.props.openView(item.id, item.curse, item.date, item.hour, item.annotations)}
        />);
    }
    _getItemLayout(_data: DataGroup[] | null | undefined, index: number) {
        return {
            length: 125,
            offset: 125 * index,
            index
        };
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onShow={this.updateDataLocal} onRequestClose={this.props.close}>
            {(this.props.datas)?<View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.props.close} />
                    <Appbar.Content title={`Busqueda: ${this.state.title}`}  />
                </Appbar.Header>
                <View style={{ flex: 2 }}>
                    {(this.props.visible)&&<FlatList
                        data={this.props.datas}
                        keyExtractor={this._keyExtractor}
                        contentContainerStyle={{ flex: (this.props.datas.length == 0)? 2: undefined, paddingTop: 8 }}
                        ListEmptyComponent={()=><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún registro</Text></View>}
                        renderItem={this._renderItem}
                        getItemLayout={this._getItemLayout}
                    />}
                </View>
            </View>: <></>}
        </CustomModal>);
    }
};

type IProps2 = {
    data: StudentsData;
    type: number | undefined;
    scaleImage: number;
};
type IState2 = {
    viewLoad: boolean;
    viewDone: boolean;
    viewError: boolean;
    errorMessage: string;
    heightLayout: number;
};
class CustomCredentialDownload extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            viewLoad: false,
            viewDone: false,
            viewError: false,
            errorMessage: '',
            heightLayout: 0
        };
        this.goGenerate = this.goGenerate.bind(this);
    }
    
    downloadImageTarget(ref: ViewShot): Promise<boolean> {
        return new Promise(async(resolve, reject)=>{
            const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, { title: "Atención", message: "Para guardar la imagen se necesita acceder al almacenamiento de su dispositivo, por favor acepte los permisos que se requieren.", buttonNegative: "Cancelar", buttonPositive: "Aceptar" });
            if (permission == PermissionsAndroid.RESULTS.DENIED) return reject('Se denegó el acceso al almacenamiento.');
            if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`)) RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`);
            if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/${decode(this.props.data.curse)}/`)) RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/${decode(this.props.data.curse)}/`);
            captureRef(ref, { quality: 1, format: 'png' })
                .then((uri)=>{
                    var codeName: number = Math.floor(Math.random() * (99999 - 10000)) + 10000;
                    var nameFile: string = `student-${this.props.data.id}-credential-${codeName}`;
                    RNFS.copyFile(uri, `${RNFS.DownloadDirectoryPath}/tecnica-digital/${decode(this.props.data.curse)}/${nameFile}.png`)
                        .then(()=>resolve(true))
                        .catch(()=>reject('Error al guardar la imagen'));
                })
                .catch(()=>reject('Error al generar la imagen.'));
        });
    }
    goGenerate(ref: ViewShot) {
        this.setState({ viewLoad: true }, ()=>
            this.downloadImageTarget(ref)
                .then(()=>this.setState({ viewLoad: false, viewDone: true }))
                .catch((e)=>this.setState({ viewLoad: false, viewError: true, errorMessage: e }, ()=>setTimeout(()=>this.setState({ viewError: false, errorMessage: '' }), 3000)))
        );
    }

    render(): React.ReactNode {
        return(<View style={{ position: 'relative' }} onLayout={({ nativeEvent })=>this.setState({ heightLayout: nativeEvent.layout.height })}>
            <CustomCredential
                key={`credential-${decode(this.props.data.dni)}`}
                scale={this.props.scaleImage}
                style={styles.target}
                image={`${urlBase}/image/${decode(this.props.data.picture)}`}
                name={decode(this.props.data.name)}
                dni={decode(this.props.data.dni)}
                type={this.props.type}
                onPress={this.goGenerate}
            />
            {(this.state.viewDone)&&<TransparentView icon={'check-outline'} message={'Imagen guardada con éxito.'} heightLayout={this.state.heightLayout} backgroundColor={'rgba(0, 247, 1, 0.6)'} />}
            {(this.state.viewError)&&<TransparentView icon={'alert-circle-outline'} message={this.state.errorMessage} heightLayout={this.state.heightLayout} backgroundColor={'rgba(247, 0, 0, 0.6)'} />}
            {(this.state.viewLoad)&&<View style={{ ...styles.viewTransparent, backgroundColor: 'rgba(0, 0, 0, 0.6)', height: this.state.heightLayout - 8 }}><ActivityIndicator animating /></View>}
        </View>);
    }
}

type IProps3 = {
    icon: string;
    message: string;
    heightLayout: number;
    backgroundColor: string;
};
class TransparentView extends PureComponent<IProps3> {
    constructor(props: IProps3) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={{ ...styles.viewTransparent, backgroundColor: this.props.backgroundColor, height: this.props.heightLayout - 8 }}>
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Icon name={this.props.icon} size={36} color={'#FFFFFF'} />
                <Text style={{ color: '#FFFFFF', marginTop: 8, fontWeight: 'bold', fontSize: 16 }}>{this.props.message}</Text>
            </View>
        </View>);
    }
}

const styles = StyleSheet.create({
    target: {
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 8,
        marginBottom: 4,
        marginTop: 4,
        marginLeft: 8,
        marginRight: 8
    },
    viewTransparent: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width - 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 8,
        marginBottom: 4,
        marginTop: 4,
        marginLeft: 8,
        marginRight: 8
    }
});