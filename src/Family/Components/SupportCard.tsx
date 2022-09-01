import React, { PureComponent } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Card, IconButton } from "react-native-paper";

type IProps = {
    openDialogPhone: (phone: string)=>any;
};
type IState = {};

export default class SupportCard extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this._support_open_phone = this._support_open_phone.bind(this);
        this._support_open_sms = this._support_open_sms.bind(this);
        this._support_open_email = this._support_open_email.bind(this);
        this._support_open_whatsapp = this._support_open_whatsapp.bind(this);
    }
    private listPhones: string[] = [
        '+5492291450252',
        '+5492291455666',
        '+5492291460865'
    ];
    private message: string = "*TecnicaDigital Soporte*\n\n ";
    getPhone() {
        const index = Math.floor(Math.random() * ((this.listPhones.length - 1) - 0 + 1) + 0);
        return this.listPhones[index];
    }
    _support_open_phone() {
        this.props.openDialogPhone(this.getPhone());
    }
    _support_open_sms() {
        Linking.openURL(`sms:${this.getPhone()}?body=${this.message.replace(/\*/gi, '')}`);
    }
    _support_open_email() {
        Linking.openURL(`mailto:tecnicadigitalmiramar@gmail.com?subject=${this.message.replace(/\*/gi, '').replace(/\n/gi, '')}`);
    }
    _support_open_whatsapp() {
        Linking.openURL(`whatsapp://send?text=${this.message}&phone=${this.getPhone()}`);
    }
    render(): React.ReactNode {
        return(<Card style={styles.supportCard} elevation={3}>
            <Card.Title title={'Soporte:'} />
            <Card.Content>
                <View style={styles.supportCardContent}>
                    <IconButton color={"#15b2f7"} animated icon={'phone'} style={styles.buttonsContacts} onPress={this._support_open_phone} />
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