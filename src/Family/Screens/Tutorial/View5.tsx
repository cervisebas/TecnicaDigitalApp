import React, { PureComponent } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Title, Paragraph, Button } from "react-native-paper";
import Support from "../../../Assets/Tutorial/Support.webp";

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
            <Title style={styles.title}>Háblanos cuando lo necesites</Title>
            <FastImage source={Support} style={[styles.image, this.state.imageSize]} />
            <Paragraph style={styles.paragraph}>Comunícate con el soporte por cualquier duda o inconveniente que tengas. Nosotros trataremos de responderte lo más rápidos que podamos cuando estemos disponibles.</Paragraph>
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
    }
});