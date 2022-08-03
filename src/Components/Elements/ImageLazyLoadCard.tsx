import React, { PureComponent } from "react";
import { ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import RNFS from "react-native-fs";
import FastImage from "react-native-fast-image";

type IProps = {
    source: {
        uri: string;
    };
    style?: StyleProp<ViewStyle>;
    circle?: boolean;
    size?: number;
    enableCustomSize?: boolean;
    customSize?: {
        width: number;
        height: number;
    }
    onLoad?: ()=>any;
};
type IState = {
    isLoading: boolean;
    source: ImageSourcePropType | undefined;
};

export default class ImageLazyLoadCard extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: true,
            source: undefined
        };
    }
    private _isMount: boolean = false;
    componentDidMount() {
        this._isMount = true;
        var fileName = this.props.source.uri.split('/').pop();
        RNFS.exists(`${RNFS.CachesDirectoryPath}/${fileName}`).then((val)=>{
            if (val) return (this._isMount)&&this.setState({ source: { uri: `file://${RNFS.CachesDirectoryPath}/${fileName}` }, isLoading: false });
            RNFS.downloadFile({ fromUrl: this.props.source.uri, toFile: `${RNFS.CachesDirectoryPath}/${fileName}` }).promise
                .then(()=>(this._isMount)&&this.setState({ source: { uri: `file://${RNFS.CachesDirectoryPath}/${fileName}` }, isLoading: false }))
                .catch(()=>(this._isMount)&&this.setState({ source: require('../../Assets/profile.png'), isLoading: false }));
        })
        .catch(()=>(this._isMount)&&this.setState({ source: require('../../Assets/profile.png'), isLoading: false }));
    }
    componentWillUnmount() {
        this._isMount = false;
    }
    render(): React.ReactNode {
        return(<View style={[styles.view, (this.props.enableCustomSize)? this.props.customSize: { width: this.props.size, height: this.props.size }, this.props.style, (this.props.circle)&&styles.circle]}>
            {(this.state.isLoading)?<SkeletonPlaceholder>
                <SkeletonPlaceholder.Item width={'100%'} height={'100%'} />
            </SkeletonPlaceholder>:
            <FastImage
                source={this.state.source! as any}
                style={(this.props.enableCustomSize)? this.props.customSize: { width: this.props.size, height: this.props.size }}
                resizeMode={'cover'}
                onLoad={this.props.onLoad}
                onError={this.props.onLoad}
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
        borderRadius: 1000000,
        overflow: 'hidden'
    }
});