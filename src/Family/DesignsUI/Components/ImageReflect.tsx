import React, { PureComponent } from "react";
import { Image, ImageProps, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ThemeContext } from "../../../Components/ThemeProvider";
import RNFS from "react-native-fs";
// Images
import ProfilePicture from "../../../Assets/profile.webp";

type IProps = {
    source: {
        uri: string;
    };
    style?: StyleProp<ViewStyle>;
    size?: number;
    onLoad?: ()=>any;
    nativeImageProps?: ImageProps;
};
type IState = {
    isLoading: boolean;
    source: ImageSourcePropType | undefined;
};

export default class ImageReflect extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            source: undefined
        };
        this.updateImage = this.updateImage.bind(this);
    }
    private _isMount: boolean = false;
    static contextType = ThemeContext;
    componentDidMount() {
        this._isMount = true;
        this.updateImage();
    }
    componentWillUnmount(): void {
        this._isMount = false;
    }
    componentDidUpdate(prevProps: Readonly<IProps>): void {
        if (prevProps.source.uri !== this.props.source.uri) this.forceNowUpdate();
    }
    forceNowUpdate() {
        this.setState({
            isLoading: true,
            source: undefined
        }, this.updateImage);
    }
    updateImage() {
        var fileName = this.props.source.uri.split('/').pop();
        RNFS.exists(`${RNFS.CachesDirectoryPath}/${fileName}`).then((val)=>{
            if (val) return (this._isMount)&&this.setState({ source: { uri: `file://${RNFS.CachesDirectoryPath}/${fileName}` }, isLoading: false });
            RNFS.downloadFile({ fromUrl: this.props.source.uri, toFile: `${RNFS.CachesDirectoryPath}/${fileName}` }).promise
                .then(()=>(this._isMount)&&this.setState({ source: { uri: `file://${RNFS.CachesDirectoryPath}/${fileName}` }, isLoading: false }))
                .catch(()=>(this._isMount)&&this.setState({ source: ProfilePicture, isLoading: false }));
        }).catch(()=>(this._isMount)&&this.setState({ source: ProfilePicture, isLoading: false }));
    }
    render(): React.ReactNode {
        return(<View style={[styles.content, (this.props.size)? { width: this.props.size, height: this.props.size }: undefined, this.props.style]}>
            <Image
                source={this.state.source}
                style={styles.image}
                onLoad={this.props.onLoad}
                onError={this.props.onLoad}
                {...this.props.nativeImageProps}
            />
            <LinearGradient
                colors={['rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 0)']}
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