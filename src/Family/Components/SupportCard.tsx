import React, { PureComponent } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Card, IconButton } from "react-native-paper";

type IProps = {
    openDialogPhone: ()=>any;
};
type IState = {};

export default class SupportCard extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    _support_open_sms() {
        Linking.openURL('sms:+5492236697986');
    }
    _support_open_email() {
        Linking.openURL('mailto:tecnicadigitalmiramar@gmail.com');
    }
    _support_open_whatsapp() {
        Linking.openURL('whatsapp://send?phone=+5492236697986');
    }
    render(): React.ReactNode {
        return(<Card style={styles.supportCard} elevation={3}>
            <Card.Title title={'Soporte:'} />
            <Card.Content>
                <View style={styles.supportCardContent}>
                    <IconButton color={"#15b2f7"} animated icon={'phone'} style={styles.buttonsContacts} onPress={this.props.openDialogPhone} />
                    <IconButton color={"#eb5c23"} animated icon={'message'} style={styles.buttonsContacts} onPress={this._support_open_sms} />
                    <IconButton color={"#25D366"} animated icon={'whatsapp'} style={styles.buttonsContacts} onPress={this._support_open_whatsapp} />
                    <IconButton color={"#ffce00"} animated icon={'email'} style={styles.buttonsContacts} onPress={this._support_open_email} />
                </View>
            </Card.Content>
        </Card>);
    }
}
const styles = StyleSheet.create({
    supportCard: {
        marginLeft: 12,
        marginRight: 12,
        marginTop: 8
    },
    supportCardContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12
    },
    buttonsContacts: {
        marginLeft: 12,
        marginRight: 12
    }
});