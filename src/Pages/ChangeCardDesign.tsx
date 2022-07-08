import React, { Component, PureComponent } from "react";
import { Dimensions, FlatList, Image, ImageSourcePropType, StyleProp, TouchableHighlight, View, ViewStyle } from "react-native";
import { Appbar, Provider as PaperProvider } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    close: ()=>any;
    onPress: (option: number | undefined)=>any;
};
type IState = {
    width: number;
};

type Item = {
    source: ImageSourcePropType;
    option: number | undefined;
};

const { width } = Dimensions.get('window');

export default class ChangeCardDesign extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            width: 0
        };
    }
    private list: Item[] | undefined = [
        { source: require('../Assets/Examples/desing1.webp'), option: undefined },
        { source: require('../Assets/Examples/desing2.webp'), option: 1 },
        { source: require('../Assets/Examples/desing4.webp'), option: 2 },
        { source: require('../Assets/Examples/desing3.webp'), option: 3 },
        { source: require('../Assets/Examples/desing5.webp'), option: 4 },
        { source: require('../Assets/Examples/desing6.webp'), option: 5 },
        { source: require('../Assets/Examples/desing7.webp'), option: 6 }
    ];
    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} style={{ padding: 16 }} animationIn={'fadeInUp'} animationOut={'fadeOutDown'} onRequestClose={()=>this.props.close()}>
            <PaperProvider theme={Theme}>
                <View onLayout={({ nativeEvent })=>this.setState({ width: nativeEvent.layout.width })} style={{ flex: 1, backgroundColor: Theme.colors.background, overflow: 'hidden', borderRadius: 8 }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={()=>this.props.close()} />
                        <Appbar.Content title={'Ver más detalles'}  />
                    </Appbar.Header>
                    {(this.props.visible)?<View style={{ flex: 2 }}>
                        {(this.list && this.state.width !== 0)&&<FlatList
                            data={this.list}
                            contentContainerStyle={{ paddingTop: 12 }}
                            renderItem={({ item, index })=><CardImages
                                key={index.toString()}
                                width={this.state.width}
                                styles={{
                                    marginTop: 0,
                                    marginBottom: 12,
                                    marginLeft: 12,
                                    marginRight: 12
                                }}
                                source={item.source}
                                onPress={()=>this.props.onPress(item.option)}
                            />}
                        />}
                    </View>: <View></View>}
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
    private styles: StyleProp<ViewStyle> | undefined = {
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
    };
    componentWillUnmount() {
        this.styles = undefined;
        this.setState({ width: 0, height: 0 });
    }
    componentDidMount() {
        var scales: number[] = [];
        for (let i = 1; i > 0; i -= 0.001) { scales.push(i); }
        scales.forEach((val)=>(((3600 * val) > (this.props.width - 24)) && this.state.width == 0)&&this.setState({ width: 3600 * val, height: 2337 * val }));
    }
    render(): React.ReactNode {
        return(<TouchableHighlight
            style={[this.styles, this.props.styles, { height: this.state.height, width: this.state.width }]}
            onPress={()=>(this.props.onPress)&&this.props.onPress()}>
            <Image
                source={this.props.source}
                resizeMode={'cover'}
                resizeMethod={'auto'}
                style={{
                    borderColor: '#000000',
                    borderWidth: 2,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    borderRadius: 8
                }}
            />
        </TouchableHighlight>);
    }
}