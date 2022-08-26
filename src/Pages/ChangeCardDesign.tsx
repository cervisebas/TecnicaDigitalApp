import React, { Component, PureComponent } from "react";
import { FlatList, ImageSourcePropType, ListRenderItemInfo, StyleProp, StyleSheet, TouchableHighlight, View, ViewStyle } from "react-native";
import FastImage from "react-native-fast-image";
import { Appbar, Provider as PaperProvider } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import Theme from "../Themes";
// Images
import Design1 from "../Assets/Examples/desing1.webp";
import Design2 from "../Assets/Examples/desing2.webp";
import Design3 from "../Assets/Examples/desing3.webp";
import Design4 from "../Assets/Examples/desing4.webp";
import Design5 from "../Assets/Examples/desing5.webp";
import Design6 from "../Assets/Examples/desing6.webp";
import Design7 from "../Assets/Examples/desing7.webp";

type IProps = {
    onChange: (option: number | undefined)=>any;
};
type IState = {
    visible: boolean;
    width: number;
};

type Item = {
    id: number;
    source: ImageSourcePropType;
    option: number | undefined;
};

export default class ChangeCardDesign extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            width: 0
        };
        this._renderItem = this._renderItem.bind(this);
        this.close = this.close.bind(this);
    }
    private list: Item[] = [
        { id: 1, source: Design1, option: undefined },
        { id: 2, source: Design2, option: 1 },
        { id: 3, source: Design4, option: 2 },
        { id: 4, source: Design3, option: 3 },
        { id: 5, source: Design5, option: 4 },
        { id: 6, source: Design6, option: 5 },
        { id: 7, source: Design7, option: 6 }
    ];
    _keyExtractor(item: Item) {
        return `card-desing-${item.id}`;
    }
    _renderItem({ item }: ListRenderItemInfo<Item>) {
        return(<CardImages
            key={`card-desing-${item.id}`}
            width={this.state.width}
            styles={styles.itemsCards}
            source={item.source}
            onPress={()=>{
                this.props.onChange(item.option);
                this.close();
            }}
        />);
    }

    // Controller
    open() {
        this.setState({ visible: true });
    }
    close() {
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} style={{ padding: 16 }} animationIn={'fadeInUp'} animationOut={'fadeOutDown'} onRequestClose={this.close}>
            <PaperProvider theme={Theme}>
                <View onLayout={({ nativeEvent })=>this.setState({ width: nativeEvent.layout.width })} style={styles.contain}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={'Ver más detalles'}  />
                    </Appbar.Header>
                    <View style={{ flex: 2 }}>
                        {(this.state.width !== 0)&&<FlatList
                            data={this.list}
                            contentContainerStyle={{ paddingTop: 12 }}
                            keyExtractor={this._keyExtractor}
                            renderItem={this._renderItem}
                        />}
                    </View>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}

type IProps2 = {
    source: ImageSourcePropType;
    width: number;
    styles?: StyleProp<ViewStyle>;
    onPress?: ()=>any;
};
type IState2 = {
    width: number;
    height: number;
};
class CardImages extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            width: 0,
            height: 0
        };
    }
    componentDidMount() {
        var isFind = false;
        var useScale = 0.001;
        while (!isFind) {
            if (((3600 * useScale) > (this.props.width - 24)) && this.state.width == 0) {
                this.setState({ width: 3600 * useScale, height: 2337 * useScale });
                isFind = true;
            } else {
                useScale += 0.001;
            }
        }
    }
    render(): React.ReactNode {
        return(<TouchableHighlight
            style={[styles.imageContain, this.props.styles, { height: this.state.height, width: this.state.width }]}
            onPress={(this.props.onPress)&&this.props.onPress}>
            <FastImage
                source={this.props.source as any}
                resizeMode={'cover'}
                style={styles.fastImageItem}
            />
        </TouchableHighlight>);
    }
}

const styles = StyleSheet.create({
    contain: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        overflow: 'hidden',
        borderRadius: 8
    },
    imageContain: {
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        maxHeight: 300,
        alignItems: 'center',
        justifyContent: 'center'
    },
    itemsCards: {
        marginTop: 0,
        marginBottom: 12,
        marginLeft: 12,
        marginRight: 12
    },
    fastImageItem: {
        borderColor: '#000000',
        borderWidth: 2,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 8
    }
});