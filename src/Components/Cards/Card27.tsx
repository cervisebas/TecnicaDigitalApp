import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import Background from "../../Assets/Desings/card29.webp";
import { StyleSheet, View } from "react-native";
import { clearString } from "../../Scripts/Utils";
import QRCode from "react-native-qrcode-svg";

type IPropsCard = {
    scale: number;
    name: string;
    dni: string;
};
type IStateCard = {};

export default class Card27 extends PureComponent<IPropsCard, IStateCard> {
    constructor(props: IPropsCard) {
        super(props);
    }
    getScale(t: number) {
        return ((this.props.scale * t) / 1);
    }
    render(): React.ReactNode {
        return(<>
            <FastImage
                source={Background}
                style={styles.background}
                resizeMode={'cover'}
            />
            <View style={[styles.viewText, {
                top: this.getScale(150),
                left: this.getScale(54),
                width: this.getScale(544),
                height: this.getScale(202)
            }]}>
                <Text
                    style={{
                        justifyContent: 'center',
                        width: '100%',
                        color: '#FFFFFF',
                        textAlign: 'center',
                        fontWeight: 'normal',
                        textShadowColor: `rgba(0, 0, 0, ${this.getScale(0.75)})`,
                        textShadowOffset: {
                            width: this.getScale(0),
                            height: this.getScale(4)
                        },
                        textShadowRadius: this.getScale(4),
                        fontSize: this.getScale(74),
                        fontFamily: 'GarthGraphicStd'
                    }}
                    numberOfLines={2}
                >{this.props.name}</Text>
            </View>
            <View style={{
                position: 'absolute',
                top: this.getScale(441),
                left: this.getScale(199),
                width: this.getScale(255),
                height: this.getScale(255)
            }}>
                <QRCode
                    value={`eest${this.props.dni}`}
                    backgroundColor={'rgba(0, 0, 0, 0)'}
                    color={'#000000'}
                    size={this.getScale(255)}
                />
            </View>
        </>);
    }
}

const styles = StyleSheet.create({
    background: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
    },
    viewText: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
    }
});