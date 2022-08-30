import Barcode from "@kichiyaki/react-native-barcode-generator";
import React, { PureComponent } from "react";
import FastImage from "react-native-fast-image";
import { Text } from "react-native-paper";
import ImageLazyLoadCard from "../Elements/ImageLazyLoadCard";
import Background from "../../Assets/Desings/default.webp";
import { StyleSheet } from "react-native";

type IPropsCard = {
    scale: number;
    image: string;
    name: string;
    dni: string;
};
type IStateCard = {
    textTop: number;
};

export default class DesingDefault extends PureComponent<IPropsCard, IStateCard> {
    constructor(props: IPropsCard) {
        super(props);
        this.state = {
            textTop: 192
        };
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
            <ImageLazyLoadCard
                source={{ uri: this.props.image }}
                size={this.getScale(300)}
                style={{
                    position: 'absolute',
                    top: this.getScale(80),
                    left: this.getScale(60),
                    overflow: 'hidden',
                    borderWidth: this.getScale(8),
                    borderColor: '#0038FF',
                    borderRadius: this.getScale(16),
                }}
            />
            <Text
                style={{
                    position: 'absolute',
                    left: this.getScale(420),
                    top: this.state.textTop,
                    justifyContent: 'center',
                    width: this.getScale(780),
                    fontSize: this.getScale(64)
                }}
                numberOfLines={2}
                onTextLayout={({ nativeEvent: { lines } })=>this.setState({ textTop: (lines.length >= 2)? this.getScale(148): this.getScale(192) })}
            >{this.props.name}</Text>
            <Barcode
                value={`eest${this.props.dni}`}
                width={this.getScale(1000)}
                maxWidth={this.getScale(1000)}
                height={this.getScale(245)}
                style={{
                    position: 'absolute',
                    top: this.getScale(480),
                    left: this.getScale(100)
                }}
            />
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
    }
});