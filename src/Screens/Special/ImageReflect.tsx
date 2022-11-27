import React, { PureComponent } from "react";
import { Image, ImageProps, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import RNFS from "react-native-fs";
// Images
import ProfilePicture from "../../../Assets/profile.webp";
import { ThemeContext } from "../../Components/ThemeProvider";

type IProps = {
    source: any;
    style?: StyleProp<ViewStyle>;
    size?: number;
    onLoad?: ()=>any;
    nativeImageProps?: ImageProps;
};
type IState = {};

export default class ImageReflect extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            source: undefined
        };
    }
    static contextType = ThemeContext;
    render(): React.ReactNode {
        return(<View style={[styles.content, (this.props.size)? { width: this.props.size, height: this.props.size }: undefined, this.props.style]}>
            <Image
                source={this.props.source}
                style={styles.image}
                onLoad={this.props.onLoad}
                onError={this.props.onLoad}
                {...this.props.nativeImageProps}
            />
            <LinearGradient
                colors={['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0)']}
                style={styles.gradient}
                locations={[0.8, 1]}
            />
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        position: 'relative',
        overflow: 'visible'
    },
    gradient: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        borderRadius: 0,
        elevation: 0
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'   
    }
});