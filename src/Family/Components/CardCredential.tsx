import { decode } from "base-64";
import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, Dimensions, EventSubscription, PermissionsAndroid, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Button, Card, IconButton, Text } from "react-native-paper";
import ViewShot, { captureRef } from "react-native-view-shot";
import CustomCredential from "../../Components/CustomCredential";
import { urlBase } from "../../Scripts/ApiTecnica";
import { StudentsData } from "../../Scripts/ApiTecnica/types";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import Theme from "../../Themes";
import Tooltip from "react-native-walkthrough-tooltip";
import { ThemeContext } from "../../Components/ThemeProvider";
import overlay from "react-native-paper/src/styles/overlay";

type IProps = {
    studentData: StudentsData;
    designCardElection: number | undefined;
    // Functions
    openChangeDesign: ()=>any;
    openImageViewer: (uri: string)=>any;
    showSnackbar: (text: string)=>any;
    showLoading: (visible: boolean, text?: string)=>any;
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
    static contextType = ThemeContext;
    componentDidMount(): void {
        const { width } = Dimensions.get('window');
        var isFind = false;
        var scaleImage = 1;
        while (!isFind) {
            if (((1200 * scaleImage) < (width - 56)) && this.state.scaleImage == 0) {
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
    generateImage(result?: "tmpfile" | "base64" | "data-uri" | "zip-base64" | undefined): Promise<string> {
        return new Promise((resolve, reject)=>{
            captureRef(this.refTarget, { quality: 1, format: 'png', result: (result)? result: 'tmpfile' })
                .then(resolve)
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
        this.generateImage()
            .then((uri)=>{
                const codeName: number = Math.floor(Math.random() * (99999 - 10000)) + 10000;
                const nameFile: string = `student-${this.props.studentData!.id}-credential-${codeName}`;
                RNFS.copyFile(uri, `${RNFS.DownloadDirectoryPath}/${nameFile}.png`)
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
    /* ************************* */

    _buttonRightTitle(props: { size: number; }) {
        return(<TooltipButtonDesigns
            props={props}
            openChangeDesign={this.props.openChangeDesign}
        />);
    }
    _viewImageTarget() {
        this.generateImage()
            .then(this.props.openImageViewer)
            .catch(()=>this.props.showSnackbar('Error al generar la imagen.'));
    }
    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View>
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
                        style={[styles.target, { borderColor: theme.colors.text }]}
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

type IProps2 = {
    props: { size: number };
    openChangeDesign: ()=>any;
};
type IState2 = {
    showPopover: boolean;
};

class TooltipButtonDesigns extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            showPopover: false
        };
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
    }
    private event: EventSubscription | null = null;
    static contextType = ThemeContext;
    componentDidMount(): void {
        this.event = DeviceEventEmitter.addListener('OpenDesignsPopover', this.open);
    }
    componentWillUnmount(): void {
        this.event?.remove();
    }
    open() {
        this.setState({ showPopover: true });
    }
    close() {
        this.setState({ showPopover: false });
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<Tooltip
            isVisible={this.state.showPopover}
            contentStyle={{ backgroundColor: (isDark)? overlay(24, theme.colors.surface): "#FFFFFF" }}
            content={<View style={styles.tooltipContent}>
                <View style={styles.tooltipContent2}>
                    <Text style={styles.tooltipContent2Title}>¡¡¡Descubre más diseños aquí!!!</Text>
                </View>
                <Text style={styles.tooltipContentText}>Tenemos una gran galería de diseños para enseñarte. Si se te ocurre alguna idea para añadir a esta lista no dudes en enviárnosla al soporte.</Text>
                <Button mode={'text'} onPress={this.close}>Cerrar</Button>
            </View>}
            placement={"top"}
            accessible={false}
            onClose={this.close}>
            <IconButton
                {...this.props.props}
                icon={'pencil-ruler'}
                color={Theme.colors.accent}
                onPress={this.props.openChangeDesign}
                onLongPress={(__DEV__)? this.open: undefined}
            />
        </Tooltip>);
    }
}

const styles = StyleSheet.create({
    tooltipContent: {
        maxWidth: 240,
        paddingTop: 8
    },
    tooltipContent2: {
        width: '100%',
        alignItems: 'center'
    },
    tooltipContent2Title: {
        fontWeight: 'bold',
        fontSize: 14
    },
    tooltipContentText: {
        marginTop: 14,
        marginBottom: 4
    },
    card: {
        marginLeft: 12,
        marginRight: 12,
        marginTop: 8
    },
    target: {
        overflow: 'hidden',
        borderWidth: 1.5,
        borderRadius: 8
    },
    cardActions: {
        justifyContent: 'flex-end'
    }
});