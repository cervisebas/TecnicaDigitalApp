import React, { PureComponent } from "react";
import { StyleProp, ViewStyle, View, Text, StyleSheet } from "react-native";
import { List, Menu, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ImageLazyLoad from "./ImageLazyLoad";

type IProps2 = {
    source: { uri: string; },
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
type leftProps = {
    color: string;
    style: {
        marginLeft: number;
        marginRight: number;
        marginVertical?: number | undefined;
    };
};

export default class ItemDirective extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            menuVisible: false
        };
        this._description = this._description.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.hideMenu = this.hideMenu.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.leftImage = this.leftImage.bind(this);
    }
    _description() {
        return(<View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {(this.props.permission >= 3)&&<Icon name={'shield-crown-outline'} size={20} />}
            <Text style={{ marginLeft: 4 }}>{this.props.position}</Text>
        </View>);
    }
    showMenu() {
        this.setState({ menuVisible: true });
    }
    hideMenu() {
        this.setState({ menuVisible: false });
    }
    onEdit() {
        this.setState({ menuVisible: false }, (this.props.onEdit)&&this.props.onEdit);
    }
    onDelete() {
        this.setState({ menuVisible: false }, (this.props.onDelete)&&this.props.onDelete);
    }
    leftImage(props: leftProps) {
        return(<ImageLazyLoad
            {...props}
            size={48}
            circle={true}
            source={this.props.source}
        />);
    }
    render(): React.ReactNode {
        return(<List.Item
            title={this.props.title}
            description={this._description}
            style={styles.items}
            onPress={(this.props.onPress)&&this.props.onPress}
            onLongPress={this.showMenu}
            left={this.leftImage}
            right={()=><Menu
                visible={this.state.menuVisible}
                onDismiss={this.hideMenu}
                anchor={<IconButton icon={'dots-vertical'} onPress={this.showMenu} />}>
                <Menu.Item onPress={this.onEdit} title="Editar" />
                <Menu.Item onPress={this.onDelete} style={{ backgroundColor: '#FF0000' }} title={<Text style={{ color: '#FFFFFF' }}>Eliminar</Text>} />
            </Menu>}
        />);
    }
}

const styles = StyleSheet.create({
    items: {
        height: 64
    }
});