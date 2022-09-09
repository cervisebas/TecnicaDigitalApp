import { decode } from "base-64";
import React, { createRef, PureComponent } from "react";
import { Dimensions, PermissionsAndroid, StyleSheet, View } from "react-native";
import { Button, Card, IconButton } from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import CustomCredential from "../../Components/CustomCredential";
import { urlBase } from "../../Scripts/ApiTecnica";
import { StudentsData } from "../../Scripts/ApiTecnica/types";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import Theme from "../../Themes";

type IProps = {
    studentData: StudentsData;
    designCardElection: number | undefined;
    // Functions
    openChangeDesign: ()=>any;
    openImageViewer: (src: { uri: string })=>any;
    showSnackbar: (text: string)=>any;
    showLoading: (visible: boolean, text?: string, then?: ()=>any)=>any;
};
type IState = {
    scaleImage: number;
    showPopover: boolean;
    showCustomization: boolean;
};

export default class CardCredential extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            scaleImage: 0,
            showPopover: false,
            showCustomization: true
        };
        this._buttonRightTitle = this._buttonRightTitle.bind(this);
        this._viewImageTarget = this._viewImageTarget.bind(this);
        this.shareImageTarget = this.shareImageTarget.bind(this);
        this.downloadImageTarget = this.downloadImageTarget.bind(this);
    }
    private refTarget = createRef<ViewShot>();
    componentDidMount(): void {
        const { width } = Dimensions.get('window');
        var isFind = false;
        var scaleImage = 1;
        while (!isFind) {
            if (((1200 * scaleImage) < (width - 48)) && this.state.scaleImage == 0) {
                this.setState({
                    scaleImage,
                    showCustomization: decode(this.props.studentData.curse).toLowerCase().indexOf('docente') == -1 && decode(this.props.studentData.curse).toLowerCase().indexOf('profesor') == -1
                });
                isFind = true;
            } else {
                scaleImage -= 0.001;
            }
        }
    }

    /* CREATE IMAGE, SHARE AND DOWNLOAD */
    generateImage(result?: "tmpfile" | "base64" | "data-uri" | "zip-base64" | undefined): Promise<{ uri: string }> {
        return new Promise((resolve, reject)=>{
            captureRef(this.refTarget, { quality: 1, format: 'png', result: (result)? result: 'tmpfile' })
                .then((src)=>resolve({ uri: src }))
                .catch(reject);
        });
    }
    async downloadImageTarget() {
        const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
            title: "Atención",
            message: "Para guardar la imagen se necesita acceder al almacenamiento de su dispositivo, por favor acepte los permisos que se requieren.",
            buttonNegative: "Cancelar",
            buttonPositive: "Aceptar"
        });
        if (permission == PermissionsAndroid.RESULTS.DENIED) return this.props.showSnackbar('Se denegó el acceso al almacenamiento.');
        await this.verifyFolder();
        this.generateImage()
            .then((src)=>{
                const codeName: number = Math.floor(Math.random() * (99999 - 10000)) + 10000;
                const nameFile: string = `student-${this.props.studentData!.id}-credential-${codeName}`;
                RNFS.copyFile(src.uri, `${RNFS.DownloadDirectoryPath}/tecnica-digital/${decode(this.props.studentData!.curse)}/${nameFile}.png`)
                    .then(()=>this.props.showSnackbar('Imagen guardada con éxito'))
                    .catch(()=>this.props.showSnackbar('Error al guardar la imagen'));
            })
            .catch(()=>this.props.showSnackbar('Error al generar la imagen.'));
    }
    shareImageTarget() {
        this.props.showLoading(true, 'Espere por favor...');
        this.generateImage('base64')
            .then((base64)=>{
                const nameFile: string = `student-${this.props.studentData!.id}-credential-${Math.floor(Math.random() * (99999 - 10000)) + 10000}.png`;
                this.props.showLoading(false);
                Share.open({
                    url: `data:image/png;base64,${base64}`,
                    filename: nameFile,
                    type: 'png',
                    showAppsToView: false,
                    isNewTask: true
                }).catch(()=>this.props.showSnackbar('Acción cancelada por el usuario.'));
            })
            .catch(()=>{
                this.props.showLoading(false);
                this.props.showSnackbar('Error al generar la imagen.');
            });
    }
    async verifyFolder() {
        if (this.props.studentData) {
            if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`)) RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/`);
            if (!await RNFS.exists(`${RNFS.DownloadDirectoryPath}/tecnica-digital/${decode(this.props.studentData.curse)}/`)) RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/tecnica-digital/${decode(this.props.studentData.curse)}/`);
        }
    }
    /* ************************* */

    _buttonRightTitle(props: { size: number; }) {
        return(<IconButton
            {...props}
            icon={'pencil-ruler'}
            color={Theme.colors.accent}
            onPress={this.props.openChangeDesign}
        />);
    }
    _viewImageTarget() {
        this.generateImage()
            .then(this.props.openImageViewer)
            .catch(()=>this.props.showSnackbar('Error al generar la imagen.'));
    }
    render(): React.ReactNode {
        return(<View style={styles.content}>
            <Card style={styles.card} elevation={3}>
                <Card.Title
                    title={'Tarjeta de ingreso'}
                    right={(this.state.showCustomization)? this._buttonRightTitle: undefined}
                />
                <Card.Content>
                    <CustomCredential
                        scale={this.state.scaleImage}
                        image={`${urlBase}/image/${decode(this.props.studentData.picture)}`}
                        name={decode(this.props.studentData.name)}
                        dni={decode(this.props.studentData.dni)}
                        style={styles.target}
                        refTarget2={this.refTarget}
                        type={this.props.designCardElection}
                        onPress={this._viewImageTarget}
                    />
                </Card.Content>
                <Card.Actions style={styles.cardActions}>
                    <Button icon={'cloud-download-outline'} onPress={this.downloadImageTarget}>Descargar</Button>
                    <Button icon={'share-variant-outline'} onPress={this.shareImageTarget}>Compartir</Button>
                </Card.Actions>
            </Card>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        paddingBottom: 12
    },
    card: {
        marginLeft: 8,
        marginRight: 8
    },
    target: {
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: '#000000',
        borderRadius: 8
    },
    cardActions: {
        justifyContent: 'flex-end'
    }
});