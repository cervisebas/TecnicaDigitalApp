import React, { PureComponent } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Title, Paragraph, Button, Text } from "react-native-paper";
import Support from "../../../Assets/Tutorial/Project2022.webp";

type IProps = {
    nextButton?: ()=>any;
    restart?: ()=>any;
};
type IState = {
    imageSize: {
        width: number;
        height: number;
    };
};

const { width } = Dimensions.get('window');

export default class View4 extends PureComponent<IProps, IState> {
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
        const ImageSizes = Image.resolveAssetSource(Support);
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
            <Title style={styles.title}>Gracias por participar</Title>
            <FastImage source={Support} style={[styles.image, this.state.imageSize]} />
            <Paragraph style={styles.paragraph}>Este es un proyecto creado por alumnos de 7º3 y 7º1 en el año 2022, desarrollado por <Text style={styles.focus}>SCDev</Text> y los integrantes <Text style={styles.focus}>Falabella Tomas</Text>, <Text style={styles.focus}>Saffer Ignacio</Text>, <Text style={styles.focus}>Stefano Zapata</Text> y <Text style={styles.focus}>Zuchelli Raúl Andrés</Text>.</Paragraph>
            <Button
                children={'Finalizar'}
                mode={'text'}
                style={styles.button}
                contentStyle={styles.buttonContent}
                icon={'arrow-right'}
                onPress={this.props.nextButton}
            />
            <Button
                children={'Repetir'}
                mode={'text'}
                style={styles.buttonRestart}
                icon={'reload'}
                onPress={this.props.restart}
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
        bottom: 60
    },
    buttonRestart: {
        position: 'absolute',
        top: 0,
        right: 0,
        marginTop: 12,
        marginRight: 12
    },
    buttonContent: {
        flexDirection: 'row-reverse'
    },
    image: {
        width: width - 64,
        minHeight: 60
    },
    focus: {
        fontWeight: 'bold'
    }
});