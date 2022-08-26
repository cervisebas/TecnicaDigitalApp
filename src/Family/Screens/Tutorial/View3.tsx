import React, { PureComponent } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Title, Paragraph, Button } from "react-native-paper";
import NotificationsImage from "../../../Assets/Tutorial/Notifications.webp";

type IProps = {
    nextButton?: ()=>any;
};
type IState = {
    imageSize: {
        width: number;
        height: number;
    };
};

const { width } = Dimensions.get('window');

export default class View3 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            imageSize: {
                width: 0,
                height: 0
            }
        };
    }
    componentDidMount(): void {
        const ImageSizes = Image.resolveAssetSource(NotificationsImage);
        const newWidth = width - 64;
        this.setState({
            imageSize: {
                width: newWidth,
                height: ImageSizes.height * (newWidth / ImageSizes.width)
            }
        });
    }
    render(): React.ReactNode {
        return(<View style={styles.contain}>
            <Title style={styles.title}>Suscríbete al servicio de notificaciones</Title>
            <FastImage source={NotificationsImage} style={[styles.image, this.state.imageSize]} />
            <Paragraph style={styles.paragraph}>Una vez activada la opción recibirás una notificación cada vez que se confirme tu asistencia dentro de la escuela.</Paragraph>
            <Button
                children={'Siguiente'}
                mode={'text'}
                style={styles.button}
                contentStyle={styles.buttonContent}
                icon={'arrow-right'}
                onPress={this.props.nextButton}
            />
        </View>);
    }
}
const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 24
    },
    paragraph: {
        marginLeft: 12,
        marginRight: 12,
        marginTop: 16,
        textAlign: 'center'
    },
    contain: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    button: {
        position: 'absolute',
        bottom: 80
    },
    buttonContent: {
        flexDirection: 'row-reverse'
    },
    image: {
        width: width - 64,
        minHeight: 60
    }
});