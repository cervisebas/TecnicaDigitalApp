import React, { PureComponent } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import CustomModal from "../../Components/CustomModal";
import LogoSweep from "../../Assets/Tutorial/logo_sweep.webp";
import ImageReflect from "./ImageReflect";
import { Button, Text } from "react-native-paper";

type IProps = {};
type IState = {
    visible: boolean;
};

export default class SpecialPresentation extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false
        };
        this.close = this.close.bind(this);
    }
    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        const deviceSize = Dimensions.get('window');
        const sizeImage = {
            width: deviceSize.width - 220,
            height: deviceSize.width - 220
        };
        return(<CustomModal visible={this.state.visible}>
            <View style={styles.content}>
                <View style={styles.buttons}>
                    <Button icon={'close'} contentStyle={styles.buttonContent} onPress={this.close}>Cerrar</Button>
                    {/*<Button icon={'arrow-right'} contentStyle={styles.buttonContent}>Momentos</Button>*/}
                </View>
                <Text style={styles.title}>Gracias por participar</Text>
                <View style={[styles.imageContent]}>
                    <Image style={[styles.logo, sizeImage]} source={LogoSweep} />
                    <View style={[styles.down, { top: sizeImage.width }]} />
                    <ImageReflect
                        source={LogoSweep}
                        size={sizeImage.width}
                        style={[styles.imageReflect, { bottom: -sizeImage.width }]}
                        nativeImageProps={{ blurRadius: 10 }}
                    />
                </View>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageContent: {
        position: 'relative',
        transform: [{ translateY: 80 }],
        width: '100%',
        alignItems: 'center'
    },
    logo: {
        maxHeight: 416,
        maxWidth: 416
    },
    imageReflect: {
        position: 'absolute',
        transform: [{ rotate: '180deg' }, { scaleX: -1 }],
        maxHeight: 416,
        maxWidth: 416
    },
    down: {
        position: 'absolute',
        width: '90%',
        height: '100%',
        backgroundColor: '#000000',
        borderTopLeftRadius: 150,
        borderTopRightRadius: 150,
        borderTopColor: 'rgba(255, 255, 255, 0.5)',
        borderTopWidth: 2
    },
    title: {
        color: '#FFFFFF',
        fontSize: 40,
        textAlign: 'center',
        fontWeight: 'bold',
        transform: [{ translateY: -40 }],
        textTransform: 'uppercase',
        textShadowColor: 'rgba(255, 255, 255, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    buttonContent: {
        flexDirection: 'row-reverse'
    },
    buttons: {
        position: 'absolute',
        top: 16,
        right: 8,
        alignItems: 'flex-end'
    }
});