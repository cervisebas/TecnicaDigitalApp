import React, { PureComponent } from "react";
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { Button, Colors, Text } from "react-native-paper";
import LogoSweep from "../../../Assets/Tutorial/logo_sweep.webp";
import CustomBackgroundSession from "../../../Components/CustomBackgroundSession";

type IProps = {
    nextButton?: ()=>any;
};
type IState = {};

const { width } = Dimensions.get('window');

export default class View1 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.contain}>
            <CustomBackgroundSession style={styles.imageBackground} />
            <Text style={styles.firstText}>¿Primera vez aquí?</Text>
            <View style={styles.content1}>
                <FastImage style={styles.logo} source={LogoSweep} />
                <CustomTitle />
            </View>
            <Button
                children={'Continuar'}
                mode={'contained'}
                style={styles.button}
                contentStyle={styles.buttonContent}
                icon={'arrow-right'}
                onPress={this.props.nextButton}
            />
        </View>);
    }
}

type IProps2 = { style?: StyleProp<ViewStyle>; };
class CustomTitle extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={[this.props.style, { alignItems: 'center' }]}>
            <Text style={styles.titleContent}>Bienvenid@ a</Text>
            <Text>
                <Text style={styles.title1}>Tecnica</Text>
                <Text style={styles.title2}>Digital</Text>
            </Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    titleContent: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20
    },
    title1: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.red500,
        textShadowColor: 'rgba(244, 67, 54, 0.4)',
        textShadowOffset: {
            width: -1,
            height: 1
        },
        textShadowRadius: 2
    },
    title2: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.blue800,
        textShadowColor: 'rgba(21, 101, 192, 0.4)',
        textShadowOffset: {
            width: -1,
            height: 1
        },
        textShadowRadius: 2
    },
    firstText: {
        fontSize: 16,
        fontWeight: '700',
        position: 'absolute',
        top: 0,
        left: 0,
        marginTop: 12,
        marginLeft: 12
    },
    content1: {
        marginTop: -64,
        width: '100%',
        alignItems: 'center'
    },
    contentTitle: {
        alignItems: 'center',
        marginTop: 20
    },
    button: {
        position: 'absolute',
        bottom: 60
    },
    buttonContent: {
        flexDirection: 'row-reverse'
    },
    contain: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
    },
    logo: {
        width: width - 160,
        height: width - 160,
        maxHeight: 416,
        maxWidth: 416 
    },
    imageBackground: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }
});