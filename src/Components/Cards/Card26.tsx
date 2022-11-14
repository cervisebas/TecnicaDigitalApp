import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import Background from "../../Assets/Desings/card28.webp";
import { StyleSheet, View } from "react-native";
import { clearString } from "../../Scripts/Utils";
import QRCode from "react-native-qrcode-svg";

type IPropsCard = {
    scale: number;
    name: string;
    dni: string;
};
type IStateCard = {};

export default class Card26 extends PureComponent<IPropsCard, IStateCard> {
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
            <View style={[styles.viewText, { top: this.getScale(610), height: this.getScale(169) }]}>
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
                        fontSize: this.getScale(34),
                        fontFamily: 'Bumbastika'
                    }}
                    numberOfLines={1}
                >{clearString(this.props.name)}</Text>
            </View>
            <View style={{
                position: 'absolute',
                top: this.getScale(998),
                left: this.getScale(430),
                width: this.getScale(340),
                height: this.getScale(340),
                transform: [{
                    rotate: '180deg'
                }]
            }}>
                <QRCode
                    value={`eest${this.props.dni}`}
                    backgroundColor={'rgba(0, 0, 0, 0)'}
                    color={'#000000'}
                    size={this.getScale(340)}
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
        left: 0,
        right: 0,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }
});