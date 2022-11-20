import React, { PureComponent } from "react";
import { Image, ImageProps, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import RNFS from "react-native-fs";
import { ThemeContext } from "../ThemeProvider";
// Images
import ProfilePicture from "../../Assets/profile.webp";

type IProps = {
    source: {
        uri: string;
    };
    style?: StyleProp<ViewStyle>;
    circle?: boolean;
    size?: number;
    onLoad?: ()=>any;
    nativeImageProps?: ImageProps;
};
type IState = {
    isLoading: boolean;
    source: ImageSourcePropType | undefined;
};

export default class ImageLazyLoadNative extends PureComponent<IProps, IState> {
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
        const { isDark } = this.context;
        return(<View style={[styles.view, { width: this.props.size, height: this.props.size }, this.props.style, (this.props.circle)? styles.circle: undefined, (this.props.circle)? { shadowColor: (isDark)? '#FFFFFF': '#000000' }: undefined]}>
            {(this.state.isLoading)?<SkeletonPlaceholder>
                <SkeletonPlaceholder.Item width={'100%'} height={'100%'} />
            </SkeletonPlaceholder>:
            <Image
                source={this.state.source! as any}
                style={{ width: '100%', height: '100%' }}
                onLoad={this.props.onLoad}
                onError={this.props.onLoad}
                {...this.props.nativeImageProps}
            />}
        </View>);
    }
}

const styles = StyleSheet.create({
    view: {
        position: 'relative',
        overflow: 'hidden'
    },
    circle: {
        //shadowColor: "#000000",
        shadowOffset:{
            width: 0,
            height: 1
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
        borderRadius: 1024,
        overflow: 'hidden'
    }
});