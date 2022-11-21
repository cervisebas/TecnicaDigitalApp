import React, { PureComponent } from "react";
import { StyleProp, ViewStyle, View, Text, StyleSheet, Image } from "react-native";
import { List, Menu, IconButton, overlay } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import ImageLazyLoad from "./ImageLazyLoad";
import pattern from "../../Assets/pattern3.webp";
import { ThemeContext } from "../ThemeProvider";
import Color from "color";

type IProps2 = {
    source: { uri: string; },
    title: string;
    position: string;
    permission: number;
    isCreator?: boolean;
    noLine?: boolean;
    style?: StyleProp<ViewStyle>;
    disableDesign: boolean;
    onPress?: ()=>any;
    onEdit?: ()=>any;
    onDelete?: ()=>any;
    onNotDelete?: ()=>any;
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
        this.onNotDelete = this.onNotDelete.bind(this);
        this.leftImage = this.leftImage.bind(this);
    }
    static contextType = ThemeContext;
    _description() {
        const { theme } = this.context;
        const descolor = Color(theme.colors.text).alpha(0.54).rgb().string();
        return(<View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {(this.props.permission >= 3)&&<Icon name={(this.props.isCreator)? 'crown': 'shield-crown-outline'} size={20} color={descolor} />}
            <Text style={[{ marginLeft: 4, color: descolor }, (this.props.isCreator)&&{ fontWeight: '700' }]}>{this.props.position}</Text>
            {(this.props.disableDesign)? <Text> • <Text style={{ fontWeight: 'bold' }}>Inhabilitado</Text></Text>: undefined}
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
    onNotDelete() {
        this.setState({ menuVisible: false }, (this.props.onNotDelete)&&this.props.onNotDelete);
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
        const { isDark, theme } = this.context;
        return(<View style={styles.background}>
            {(this.props.isCreator)&&<Image
                source={pattern}
                style={styles.image}
                resizeMode={'repeat'}
                resizeMethod={'resize'}
            />}
            <List.Item
                title={this.props.title}
                titleStyle={(this.props.isCreator)&&{ fontWeight: '700' }}
                description={this._description}
                style={[styles.items, (this.props.disableDesign)? { backgroundColor: Color(theme.colors.background as string).negate().alpha((isDark)? 0.25: 0.1).rgb().string() }: undefined]}
                onPress={(this.props.onPress)&&this.props.onPress}
                onLongPress={this.showMenu}
                left={this.leftImage}
                right={()=><Menu
                    visible={this.state.menuVisible}
                    onDismiss={this.hideMenu}
                    anchor={<IconButton icon={'dots-vertical'} onPress={this.showMenu} />}>
                    <Menu.Item onPress={this.onEdit} title="Editar" />
                    <Menu.Item onPress={(this.props.isCreator)? this.onNotDelete: this.onDelete} style={{ backgroundColor: '#FF0000' }} title={<Text style={{ color: '#FFFFFF' }}>Eliminar</Text>} />
                </Menu>}
            />
        </View>);
    }
}

const styles = StyleSheet.create({
    background: {
        position: 'relative',
        width: '100%',
        height: 64
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    items: {
        height: 64
    }
});