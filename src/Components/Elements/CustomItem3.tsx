import { decode } from "base-64";
import Color from "color";
import React, { PureComponent } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Checkbox, Colors, IconButton, List } from "react-native-paper";
import { urlBase } from "../../Scripts/ApiTecnica";
import { AssistUserData } from "../../Scripts/ApiTecnica/types";
import { ThemeContext } from "../ThemeProvider";
import ImageLazyLoad from "./ImageLazyLoad";

type IProps2 = {
    item: AssistUserData;
    status: "checked" | "unchecked" | "indeterminate";
    isLoading: boolean;
    onPress?: (status: boolean, finish: ()=>void)=>any;
    onPressAdd?: (finish: ()=>void)=>any;
    onPressRemove?: ()=>any;
    onPressImage: (source: string, message: string)=>any;
};
type IState2 = {
    disable: boolean;
};

export default class ItemAssitTeacher extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            disable: false
        };
        this._onPressAdd = this._onPressAdd.bind(this);
        this._onPress = this._onPress.bind(this);
    }
    static contextType = ThemeContext;
    _onPressAdd() {
        this.setState({ disable: true }, ()=>{
            if (this.props.onPressAdd)
                this.props.onPressAdd(()=>this.setState({ disable: false }))
        });
    }
    _onPress() {
        this.setState({ disable: true }, ()=>{
            if (this.props.onPress)
                this.props.onPress(!this.props.item.status, ()=>this.setState({ disable: false }))
        });
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<List.Item
            key={`conf-assist-${this.props.item.id}`}
            title={decode(this.props.item.name)}
            description={(this.props.item.exist)? `${decode(this.props.item.time)} • Ingreso con credencial`: `${decode(this.props.item.time)}`}
            disabled={this.props.isLoading || !this.props.item.existRow || this.state.disable}
            onPress={this._onPress}
            style={[styles.items, (!this.props.item.existRow)&&{ backgroundColor: Color(theme.colors.background as string).negate().alpha((isDark)? 0.25: 0.1).rgb().string() }]}
            left={(props)=><Pressable {...props} style={{ justifyContent: 'center', alignItems: 'center' }} onPress={()=>this.props.onPressImage(`${urlBase}/image/${decode(this.props.item.picture)}`, decode(this.props.item.name))}>
                <ImageLazyLoad
                    size={48}
                    circle
                    source={{ uri: `${urlBase}/image/${decode(this.props.item.picture)}` }}
                />
            </Pressable>}
            right={()=><View style={{ alignItems: 'center', flexDirection: 'row' }}>
                {(this.props.item.existRow)? <>
                    <IconButton
                        icon={'delete-outline'}
                        color={Colors.blue500}
                        disabled={this.props.isLoading || !this.props.item.existRow || this.state.disable}
                        onPress={this.props.onPressRemove}
                    />
                    <Checkbox
                        color={Colors.blue500}
                        uncheckedColor={Colors.red500}
                        disabled={this.props.isLoading || !this.props.item.existRow || this.state.disable}
                        status={this.props.status}
                    />
                </>: <IconButton
                    icon={'plus'}
                    color={Colors.green500}
                    disabled={this.props.isLoading || this.state.disable}
                    onPress={this._onPressAdd}
                />}
            </View>}
        />);
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