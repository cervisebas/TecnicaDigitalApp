import React, { PureComponent } from "react";
import { StyleProp, ViewStyle, View, Text, StyleSheet } from "react-native";
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
type leftProps = {
    color: string;
    style: {
        marginLeft: number;
        marginRight: number;
        marginVertical?: number | undefined;
    };
};

export default class ItemStudent extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            menuVisible: false
        };
        this.leftImage = this.leftImage.bind(this);
        this.rightMenu = this.rightMenu.bind(this);
        this.showMenu = this.showMenu.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }
    showMenu() {
        this.setState({ menuVisible: true });
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
    rightMenu() {
        return(<Menu
            visible={this.state.menuVisible}
            onDismiss={()=>this.setState({ menuVisible: false })}
            anchor={<IconButton icon={'dots-vertical'} onPress={this.showMenu} />}>
            <Menu.Item onPress={this.onEdit} title="Editar" />
            <Menu.Item onPress={this.onDelete} style={styles.deleteBackground} title={<Text style={styles.deleteText}>Eliminar</Text>} />
        </Menu>);
    }
    render(): React.ReactNode {
        return(<View style={this.props.style}>
            <List.Item
                title={this.props.title}
                onPress={(this.props.onPress)&&this.props.onPress}
                onLongPress={this.showMenu}
                style={styles.items}
                left={this.leftImage}
                right={this.rightMenu}
            />
            {(!this.props.noLine)&&<Divider />}
        </View>);
    }
}

const styles = StyleSheet.create({
    items: {
        height: 64
    },
    deleteBackground: {
        backgroundColor: '#FF0000'
    },
    deleteText: {
        color: '#FFFFFF'
    }
});