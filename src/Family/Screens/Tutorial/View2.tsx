import React, { PureComponent } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import FastImage from "react-native-fast-image";
import { Title, Paragraph, Button } from "react-native-paper";
import ViewAssistCard from "../../../Assets/Tutorial/ViewAssistCard.webp";

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

export default class View2 extends PureComponent<IProps, IState> {
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
        const ImageSizes = Image.resolveAssetSource(ViewAssistCard);
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
            <Title style={styles.title}>Entérate del estado de tu asistencia</Title>
            <FastImage source={ViewAssistCard} style={[styles.image, this.state.imageSize]} />
            <Paragraph style={styles.paragraph}>Aquí podrás mantenerte al tanto del estado de presencias y ausencias que llevas.</Paragraph>
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