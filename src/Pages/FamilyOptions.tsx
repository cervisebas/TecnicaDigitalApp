import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base-64";
import React, { Component, PureComponent } from "react";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import { Button, IconButton, List, Switch, Text } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { Family, urlBase } from "../Scripts/ApiTecnica";
import messaging from '@react-native-firebase/messaging';
import { StudentsData } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";
import FastImage from "react-native-fast-image";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";
// Images
import HatImage from "../Assets/hat_student.webp";
import BlackBoard from "../Assets/blackboard.webp";
import IndicatorTeacher from "../Assets/indicator-teacher.webp";

type IProps = {
    data: StudentsData | undefined;
    openImage: (src: string)=>any;
    closeSession: ()=>any;
    openDialog: (title: string, text: string)=>any;
};
type IState = {
    visible: boolean;
    idStudent: string;
    isStudent: boolean;
    switchNotifications: boolean;
};

export default class FamilyOptions extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            idStudent: '#00000',
            isStudent: true,
            switchNotifications: false
        };
        this.loadData = this.loadData.bind(this);
        this.setSwitchSubscription = this.setSwitchSubscription.bind(this);
        this.close = this.close.bind(this);
        this._openImage = this._openImage.bind(this);
        this._closeSession = this._closeSession.bind(this);
    }
    componentDidMount() {
        this.loadData(true);
    }
    loadData(s?: boolean) {
        if (!s) {
            var id = '';
            for (let i = 0; i < 5 - this.props.data!.id.length; i++) { id += '0'; }
            this.setState({
                idStudent: `#${id}${this.props.data!.id}`,
                isStudent: decode(this.props.data!.curse).toLowerCase().indexOf('docente') == -1 && decode(this.props.data!.curse).toLowerCase().indexOf('profesor') == -1
            });
        }
        Family.getSubscribeData()
            .then((v)=>this.setState({ switchNotifications: v }))
            .catch(()=>this.setState({ switchNotifications: false }));
    }
    setSwitchSubscription(opt: boolean) {
        AsyncStorage.setItem('FamilyOptionSuscribe', (opt)? '1': '0');
        Family.getDataLocal()
            .then((data)=>(opt)?
                messaging().subscribeToTopic(`student-${data.id}`):
                messaging().unsubscribeFromTopic(`student-${data.id}`));
        this.setState({ switchNotifications: opt });
    }
    _openImage() {
        this.props.openImage(`${urlBase}/image/${decode(this.props.data!.picture)}`);
    }
    
    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    // New
    _closeSession() {
        this.close();
        this.props.closeSession();
    }
    _openDialog(title: string, text: string) {
        this.close();
        this.props.openDialog(title, text);
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onShow={this.loadData} onRequestClose={this.close}>
            {(this.props.data)? <View style={styles.content}>
                <View style={styles.contentImage}>
                    {(!this.state.isStudent)&&<>
                        <FastImage source={BlackBoard} style={styles.blackboardImage} />
                        <FastImage source={IndicatorTeacher} style={styles.indicatorImage} />
                    </>}
                    <TouchableHighlight onPress={this._openImage} style={styles.touchImage}>
                        <ImageLazyLoad
                            source={{ uri: `${urlBase}/image/${decode(this.props.data.picture)}` }}
                            circle
                            style={{ width: '100%', height: '100%' }}
                        />
                    </TouchableHighlight>
                    {(this.state.isStudent)&&<FastImage source={HatImage} style={styles.crownImage} />}
                </View>
                <IconButton
                    icon={'arrow-left'}
                    onPress={this.close}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        margin: 10
                    }}
                />
                <Text style={styles.textBrand}>SCAPPS</Text>
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={{ marginTop: 8, fontSize: 24, width: '75%', textAlign: 'center' }}>{decode(this.props.data.name)}</Text>
                    <View style={{ marginTop: 16, width: '100%' }}>
                        <TextView title={'ID Estudiante'} text={this.state.idStudent} />
                        {(this.state.isStudent)&&<TextView title={'Curso'} text={decode(this.props.data.curse)} />}
                        <TextView title={'DNI'} text={decode(this.props.data.dni)} />
                        <TextView title={'Nacimiento'} text={decode(this.props.data.date)} />
                        <TextView title={'Teléfono'} text={decode(this.props.data.tel)} />
                        {(this.props.data.email.length !== 0)&&<TextView title={'E-Mail'} text={decode(this.props.data.email)} />}
                    </View>
                    <View style={{ marginTop: 12, flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        {(this.state.isStudent)&&<List.Item
                            title={"Subscribirse a las notificaciones"}
                            description={"Al activar esta opción, recibirá una notificación cada vez que se actualicé el registro del estudiante."}
                            onPress={()=>this.setSwitchSubscription(!this.state.switchNotifications)}
                            descriptionNumberOfLines={4}
                            style={{ width: '95%' }}
                            right={()=><Switch value={this.state.switchNotifications} onValueChange={this.setSwitchSubscription} />}
                        />}
                        <Button
                            mode={'contained'}
                            style={{ marginTop: 12 }}
                            onPress={this._closeSession}
                        >Cerrar sesión</Button>
                    </View>
                </View>
            </View>: <></>}
        </CustomModal>);
    }
}

type IProps2 = {
    title: string;
    text: string;
    icon?: string;
};
class TextView extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ marginLeft: 14 }}>⦿</Text>
            <Text style={{ marginLeft: 4, fontWeight: 'bold' }}>{`${this.props.title}:`}</Text>
            <Text style={{ marginLeft: 2 }}>{this.props.text}</Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        position: 'relative',
        borderRadius: 8,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 30,
        backgroundColor: Theme.colors.background,
        paddingTop: 60,
        paddingBottom: 14,
        alignItems: 'center'
    },
    contentImage: {
        position: 'absolute',
        top: -60,
        width: 120,
        height: 120,
    },
    touchImage: {
        width: '100%',
        height: '100%',
        borderRadius: 120,
        overflow: 'hidden',
        borderColor: '#000000',
        backgroundColor: '#000000',
        borderWidth: 3
    },
    crownImage: {
        position: 'absolute',
        width: 64,
        height: 61.51,
        top: -24,
        left: -11
    },
    blackboardImage: {
        position: 'absolute',
        width: 149.83,
        height: 100,
        top: -20,
        left: -60
    },
    indicatorImage: {
        position: 'absolute',
        width: 13.33,
        height: 80,
        top: 34,
        left: 128,
        transform: [{ rotate: "20deg" }]
    },
    textBrand: {
        color: '#FF2E2E',
        fontSize: 18,
        fontFamily: 'Organetto-Bold',
        position: 'absolute',
        right: 0,
        top: 0,
        margin: 18
    }
});