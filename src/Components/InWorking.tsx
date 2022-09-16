import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type IProps = {};
type IState = {};

export class InWorking extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.content}>
            <View style={styles.card}>
                <Icon name={'wrench-outline'} size={84} color={'#838383'} />
                <Text style={styles.text}>{'PROXIMAMENTE'}</Text>
            </View>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    text: {
        color: '#838383',
        fontSize: 20,
        fontWeight: '700',
        marginTop: 24
    }
});