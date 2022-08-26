import React, { PureComponent } from "react";
import { Dimensions, ImageBackground, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { Button, Colors, Text } from "react-native-paper";
import LogoSweep from "../../../Assets/Tutorial/logo_sweep.gif";
import BackgroundSession from "../../../Assets/background-session.webp";

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
        return(<ImageBackground source={BackgroundSession} resizeMode={"cover"} style={styles.contain}>
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
        </ImageBackground>);
    }
}

type IProps2 = { style?: StyleProp<ViewStyle>; };
class CustomTitle extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={[this.props.style, styles.contentTitle]}>
            <Text style={styles.title1}>Bienvenid@ a</Text>
            <Text>
                <Text style={styles.title2_1}>Tecnica</Text>
                <Text style={styles.title2_2}>Digital</Text>
            </Text>
        </View>);
    }
}

const styles = StyleSheet.create({
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
        marginTop: -64
    },
    contentTitle: {
        alignItems: 'center',
        marginTop: 20
    },
    title1: {
        fontWeight: 'bold',
        fontSize: 26
    },
    title2_1: {
        fontSize: 38,
        fontWeight: 'bold',
        color: Colors.red500
    },
    title2_2: {
        fontSize: 38,
        fontWeight: 'bold',
        color: Colors.blue800
    },
    button: {
        position: 'absolute',
        bottom: 80
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
        height: width - 160
    }
});