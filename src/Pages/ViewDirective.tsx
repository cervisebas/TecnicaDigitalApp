import { decode } from "base-64";
import React, { Component, PureComponent } from "react";
import { Image, StyleSheet, TouchableHighlight, TouchableOpacity, View } from "react-native";
import FastImage from "react-native-fast-image";
import { IconButton, Text } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";
import { urlBase } from "../Scripts/ApiTecnica";
import { DirectivesList } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    close: ()=>any;
    data: DirectivesList | undefined;
    openImage: ()=>any;
};
type IState = {};

export default class ViewDirective extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
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
    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onRequestClose={this.props.close}>
            {(this.props.data)? <View style={styles.content}>
                <View style={styles.contentImage}>
                    <TouchableHighlight onPress={this.props.openImage} style={styles.touchImage}>
                        <ImageLazyLoad
                            source={{ uri: `${urlBase}/image/${decode(this.props.data.picture)}` }}
                            circle
                            style={{ width: '100%', height: '100%' }}
                        />
                    </TouchableHighlight>
                    {(this.getIntPermission(this.props.data.permission) >= 4)&&<FastImage source={require('../Assets/Corona.webp')} style={styles.crownImage} />}
                </View>
                <IconButton
                    icon={'arrow-left'}
                    onPress={this.props.close}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        margin: 10
                    }}
                />
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <Text style={{ marginTop: 8, fontSize: 24, width: '75%', textAlign: 'center' }}>{decode(this.props.data.name)}</Text>
                    <View style={{ marginTop: 16, width: '100%' }}>
                        <TextView title={'DNI'} text={decode(this.props.data.dni)} />
                        <TextView title={'Usuario'} text={`@${decode(this.props.data.username)}`} />
                        <TextView title={'Posición'} text={decode(this.props.data.position)} />
                        <TextView title={'Nivel de permisos'} text={this.getLevelPermission(this.props.data.permission)} />
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
        height: 54.38,
        top: -28,
        left: -10
    }
});