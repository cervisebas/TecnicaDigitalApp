import React, { PureComponent } from "react";
import { StyleProp, ViewStyle, View, Text } from "react-native";
import { List, Menu, IconButton, Divider } from "react-native-paper";
import ImageLazyLoad from "./ImageLazyLoad";

type IProps2 = {
    source: { uri: string; },
    title: string;
    onPress?: ()=>any;
    noLine?: boolean;
    onEdit?: ()=>any;
    onDelete?: ()=>any;
    style?: StyleProp<ViewStyle>;
};
type IState2 = {
    menuVisible: boolean;
};
export default class ItemStudent extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            menuVisible: false
        };
    }
    render(): React.ReactNode {
        return(<View style={this.props.style}>
            <List.Item
                title={this.props.title}
                onPress={(this.props.onPress)&&this.props.onPress}
                onLongPress={()=>this.setState({ menuVisible: true })}
                left={(props)=><ImageLazyLoad {...props} size={48} circle={true} source={this.props.source} />}
                right={()=><Menu
                    visible={this.state.menuVisible}
                    onDismiss={()=>this.setState({ menuVisible: false })}
                    anchor={<IconButton icon={'dots-vertical'} onPress={()=>this.setState({ menuVisible: true })} />}>
                    <Menu.Item onPress={()=>this.setState({ menuVisible: false }, ()=>(this.props.onEdit)&&this.props.onEdit())} title="Editar" />
                    <Menu.Item onPress={()=>this.setState({ menuVisible: false }, ()=>(this.props.onDelete)&&this.props.onDelete())} style={{ backgroundColor: '#FF0000' }} title={<Text style={{ color: '#FFFFFF' }}>Eliminar</Text>} />
                </Menu>}
            />
            {(!this.props.noLine)&&<Divider />}
        </View>);
    }
}