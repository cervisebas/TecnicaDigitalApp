import React, { PureComponent, ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Button, Card, Text } from "react-native-paper";

type IProps = {
    title: string;
    subtitle: string;
    numColumns?: number;
    onPress?: ()=>any;
    position?: 'left' | 'right';
};
type IState = {};

export default class CustomCard4 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    getMargin(): StyleProp<ViewStyle> {
        if (this.props.position == undefined) return {};
        if (this.props.position == 'left') return { paddingLeft: 10, paddingRight: 5 };
        if (this.props.position == 'right') return { paddingLeft: 5, paddingRight: 10 };
    }
    getWidth(): StyleProp<ViewStyle> {
        if (this.props.numColumns == undefined) return {};
        return { width: `${100/this.props.numColumns}%` };
    }
    render(): ReactNode {
        return(<View style={[styles.content, this.getMargin(), this.getWidth()]}>
            <Card style={styles.card} elevation={2} onPress={this.props.onPress}>
                <Text style={styles.text}>{this.props.title}</Text>
                <Text style={styles.subtext}>{this.props.subtitle}</Text>
                <Button
                    icon={'arrow-right'}
                    mode={'text'}
                    contentStyle={styles.buttonContent}
                    style={styles.button}
                    children={'Ver'}
                />
            </Card>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        width: '50%',
        paddingTop: 8,
        paddingLeft: 8,
        paddingRight: 8
    },
    card: {
        flex: 2,
        height: 120,
        position: 'relative'
    },
    text: {
        position: 'absolute',
        left: 0,
        top: 0,
        marginTop: 18,
        marginLeft: 16,
        fontSize: 20
    },
    subtext: {
        position: 'absolute',
        left: 0,
        top: 0,
        marginTop: 44,
        marginLeft: 24,
        fontSize: 12,
        color: '#000000B3'
    },
    buttonContent: {
        flexDirection: 'row-reverse'
    },
    button: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        marginBottom: 6,
        marginRight: 4
    }
});