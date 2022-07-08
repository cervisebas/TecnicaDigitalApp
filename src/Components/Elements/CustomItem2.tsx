import React, { PureComponent } from "react";
import { StyleProp, ViewStyle, View, Text } from "react-native";
import { List, Avatar, Menu, IconButton, Divider } from "react-native-paper";
import { AvatarImageSource } from "react-native-paper/lib/typescript/components/Avatar/AvatarImage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type IProps2 = {
    source: AvatarImageSource,
    title: string;
    position: string;
    permission: number;
    onPress?: ()=>any;
    noLine?: boolean;
    onEdit?: ()=>any;
    onDelete?: ()=>any;
    style?: StyleProp<ViewStyle>;
};
type IState2 = {
    menuVisible: boolean;
};
export default class ItemDirective extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            menuVisible: false
        };
        this._description = this._description.bind(this);
    }
    _description() {
        return(<View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {(this.props.permission >= 3)&&<Icon name={'shield-crown-outline'} size={20} />}
            <Text style={{ marginLeft: 4 }}>{this.props.position}</Text>
        </View>);
    }
    render(): React.ReactNode {
        return(<List.Item
            title={this.props.title}
            description={this._description}
            style={{ height: 64 }}
            onPress={()=>(this.props.onPress)&&this.props.onPress()}
            onLongPress={()=>this.setState({ menuVisible: true })}
            left={(props)=><Avatar.Image {...props} size={48} source={this.props.source} />}
            right={()=><Menu
                visible={this.state.menuVisible}
                onDismiss={()=>this.setState({ menuVisible: false })}
                anchor={<IconButton icon={'dots-vertical'} onPress={()=>this.setState({ menuVisible: true })} />}>
                <Menu.Item onPress={()=>this.setState({ menuVisible: false }, ()=>(this.props.onEdit)&&this.props.onEdit())} title="Editar" />
                <Menu.Item onPress={()=>this.setState({ menuVisible: false }, ()=>(this.props.onDelete)&&this.props.onDelete())} style={{ backgroundColor: '#FF0000' }} title={<Text style={{ color: '#FFFFFF' }}>Eliminar</Text>} />
            </Menu>}
        />);
    }
}