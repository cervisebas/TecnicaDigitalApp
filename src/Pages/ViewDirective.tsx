import { decode } from "base-64";
import React, { Component, PureComponent } from "react";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import FastImage from "react-native-fast-image";
import { IconButton, overlay, Text } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";
import { urlBase } from "../Scripts/ApiTecnica";
import { DirectivesList } from "../Scripts/ApiTecnica/types";
// Images
import CoronaPicture from "../Assets/Corona.webp";
import { ThemeContext } from "../Components/ThemeProvider";

type IProps = {
    openImage: (image: string)=>any;
};
type IState = {
    visible: boolean;
    data: DirectivesList;
    idDirective: string;
};

export default class ViewDirective extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            data: this.defaultData,
            idDirective: ''
        };
        this.loadData = this.loadData.bind(this);
        this.close = this.close.bind(this);
        this.openImage = this.openImage.bind(this);
    }
    private defaultData: DirectivesList = {
        id: '',
        name: '',
        position: '',
        dni: '',
        picture: '',
        username: '',
        permission: ''
    };
    static contextType = ThemeContext;
    getLevelPermission(permission: string) {
        switch (permission) {
            case '0':
                return '0 (muy bajo)';
            case '1':
                return '1 (bajo)';
            case '2':
                return '2 (intermedio)';
            case '3':
                return '3 (intermedio)';
            case '4':
                return '4 (alto)';
            case '5':
                return '5 (muy alto)';
        }
        return '- (none)';
    }
    getIntPermission(permission: string) {
        try {
            return parseInt(permission);
        } catch {
            return 0;
        }
    }
    loadData() {
        var id = '';
        for (let i = 0; i < 5 - this.state.data.id.length; i++) { id += '0'; }
        this.setState({ idDirective: `#${id}${this.state.data.id}` });
    }
    open(data: DirectivesList) {
        this.setState({
            visible: true,
            data
        });
    }
    close() {
        this.setState({ visible: false });
    }
    openImage() {
        this.props.openImage(`${urlBase}/image/${decode(this.state.data.picture)}`);
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onShow={this.loadData} onRequestClose={this.close}>
            <View style={[styles.content, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }]}>
                <View style={styles.contentImage}>
                    <TouchableHighlight onPress={this.openImage} style={[styles.touchImage, { borderColor: theme.colors.text }]}>
                        <ImageLazyLoad
                            source={{ uri: `${urlBase}/image/${decode(this.state.data.picture)}` }}
                            circle
                            style={{ width: '100%', height: '100%' }}
                        />
                    </TouchableHighlight>
                    {(this.getIntPermission(this.state.data.permission) >= 4)&&<FastImage source={CoronaPicture} style={styles.crownImage} />}
                </View>
                <IconButton
                    icon={'arrow-left'}
                    onPress={this.close}
                    style={styles.buttonClose}
                />
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={{ marginTop: 8, fontSize: 24, width: '75%', textAlign: 'center' }}>{decode(this.state.data.name)}</Text>
                    <View style={{ marginTop: 16, width: '100%' }}>
                        <TextView title={'ID'} text={this.state.idDirective} />
                        <TextView title={'DNI'} text={decode(this.state.data.dni)} />
                        <TextView title={'Usuario'} text={`@${decode(this.state.data.username)}`} />
                        <TextView title={'Posición'} text={decode(this.state.data.position)} />
                        <TextView title={'Nivel de permisos'} text={this.getLevelPermission(this.state.data.permission)} />
                    </View>
                </View>
            </View>
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
        //backgroundColor: Theme.colors.background,
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
        //borderColor: '#000000',
        backgroundColor: '#000000',
        borderWidth: 3
    },
    crownImage: {
        position: 'absolute',
        width: 64,
        height: 54.38,
        top: -28,
        left: -10
    },
    buttonClose: {
        position: 'absolute',
        top: 0,
        left: 0,
        margin: 10
    }
});