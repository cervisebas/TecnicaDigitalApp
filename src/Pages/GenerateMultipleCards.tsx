import { decode } from "base-64";
import React, { Component, PureComponent } from "react";
import { Dimensions, FlatList, ListRenderItemInfo, PermissionsAndroid, StyleSheet, View } from "react-native";
import { Text, Appbar, FAB, Snackbar, Divider, ActivityIndicator } from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import RNFS from "react-native-fs";
import CustomCredential from "../Components/CustomCredential";
import CustomModal from "../Components/CustomModal";
import { urlBase } from "../Scripts/ApiTecnica";
import { OrderCurses, StudentsData } from "../Scripts/ApiTecnica/types";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    close: ()=>any;
    datas: StudentsData[] | undefined;
    type: number | undefined;
    showLoading: (visible: boolean, text: string, after?: ()=>any)=>any;
};
type IState = {
    scaleImage: number;
    snackBarView: boolean;
    snackBarText: string;
};

const { width } = Dimensions.get('window');

export default class GenerateMultipleCards extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            scaleImage: 0,
            snackBarView: false,
            snackBarText: ''
        };
        this._renderItem = this._renderItem.bind(this);
        this._keyExtractor = this._keyExtractor.bind(this);
    }
    componentDidMount() {
        var scales: number[] = [];
        for (let i = 1; i > 0; i -= 0.001) { scales.push(i); }
        var scaleUse: number = 0;
        scales.forEach((val)=>(((1200 * val) < (width - 16)) && scaleUse == 0) && (scaleUse = val));
        this.setState({ scaleImage: scaleUse });
    }
    componentWillUnmount() {
        this.setState({
            scaleImage: 0,
            snackBarView: false,
            snackBarText: ''
        });
    }

    

    _keyExtractor(item: StudentsData) {
        return `credential-${decode(item.dni)}`;
    }
    _renderItem({ item }: ListRenderItemInfo<StudentsData>) {
        /*return(<CustomCredential
            key={`credential-${decode(item.dni)}`}
            scale={this.state.scaleImage}
            style={styles.target}
            image={`${urlBase}/image/${decode(item.picture)}`}
            name={decode(item.name)}
            dni={decode(item.dni)}
            type={this.props.type}
            onPress={(ref)=>this.downloadImageTarget(ref, decode(item.curse), item.id)}
        />);*/
        return(<CustomCredentialDownload
            key={`credential-${decode(item.dni)}`}
            type={this.props.type}
            scaleImage={this.state.scaleImage}
            data={item}
        />);
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onRequestClose={()=>this.props.close()}>
            {(this.props.datas)?<View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={()=>this.props.close()} />
                    <Appbar.Content title={`Generar credenciales (${decode(this.props.datas[0].curse)})`}  />
                </Appbar.Header>
                <View style={{ flex: 2 }}>
                    {(this.props.visible)&&<FlatList
                        data={this.props.datas}
                        contentContainerStyle={{ paddingTop: 4, paddingBottom: 4 }}
                        ItemSeparatorComponent={()=><Divider />}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />}
                    <Snackbar
                        visible={this.state.snackBarView}
                        onDismiss={()=>this.setState({ snackBarView: false })}
                        action={{ label: 'OCULTAR', onPress: ()=>this.setState({ snackBarView: false }) }}>
                        <Text>{this.state.snackBarText}</Text>
                    </Snackbar>
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