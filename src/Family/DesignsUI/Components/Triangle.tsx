import React, { PureComponent } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type IProps = {
    style?: StyleProp<ViewStyle>;
    color: string;
    size: number;
};

export default class Triangle extends PureComponent<IProps> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={[
            styles.triangle,
            this.props.style,
            {
                borderBottomColor: this.props.color,
                borderLeftWidth: this.props.size,
                borderRightWidth: this.props.size,
                borderBottomWidth: this.props.size * 1.5
            }
        ]} />);
    }
}
  
const styles = StyleSheet.create({
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 50,
        borderRightWidth: 50,
        borderBottomWidth: 100,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        transform: [{ rotate: "180deg" }]
    }
});