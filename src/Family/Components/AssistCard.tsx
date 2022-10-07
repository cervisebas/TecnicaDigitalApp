import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, IconButton, ProgressBar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ThemeContext } from "../../Components/ThemeProvider";
import Theme from "../../Themes";

type IProps = {
    // Controller
    isLoading: boolean;
    isError: boolean;
    isDisableDetailAssist: boolean;
    messageError: string;
    // Datas
    assist: string;
    notAssist: string;
    total: string;
    // Functions
    reloadAssist: ()=>any;
    openDetailsAssit: ()=>any;
};
type IState = {};

export default class AssistCard extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    static contextType = ThemeContext;
    render(): React.ReactNode {
        const { theme } = this.context;
        return(<Card style={styles.content} elevation={3}>
            {(!this.props.isError)? <>
                {(this.props.isLoading)&&<ProgressBar indeterminate />}
                <Card.Title
                    title={'Asistencia:'}
                    right={(props)=><IconButton
                        {...props}
                        icon={'reload'}
                        disabled={this.props.isLoading}
                        onPress={this.props.reloadAssist}
                        color={Theme.colors.accent}
                    />}
                />
                <Card.Content>
                    <PointItemList title="Presentes" text={this.props.assist} />
                    <PointItemList title="Ausentes" text={this.props.notAssist} />
                    <PointItemList title="Total" text={this.props.total} />
                </Card.Content>
                <Card.Actions style={{ justifyContent: 'flex-end' }}>
                    <Button icon={'account-details'} disabled={this.props.isLoading || this.props.isDisableDetailAssist} onPress={this.props.openDetailsAssit}>Ver detalles</Button>
                </Card.Actions>
            </>:
            <>
                <Card.Content>
                    <View style={styles.contentError}>
                        <Icon name={'alert-outline'} size={48} style={{ fontSize: 48 }} color={theme.colors.text} />
                        <Text style={{ marginTop: 10 }}>{this.props.messageError}</Text>
                        <IconButton icon={'reload'} color={Theme.colors.primary} size={28} onPress={this.props.reloadAssist} style={{ marginTop: 12 }} />
                    </View>
                </Card.Content>
            </>}
        </Card>);
    }
}

type IProps2 = { title: string; text: string };
class PointItemList extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.pointItem}>
            <Text style={styles.pointItem_text1}>⦿</Text>
            <Text style={styles.pointItem_text2}>{`${this.props.title}:`}</Text>
            <Text style={styles.pointItem_text3}>{this.props.text}</Text>
        </View>);
    }
};

const styles = StyleSheet.create({
    pointItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    pointItem_text1: { marginLeft: 14 },
    pointItem_text2: { marginLeft: 6, fontWeight: 'bold' },
    pointItem_text3: { marginLeft: 2 },
    content: {
        marginLeft: 12,
        marginRight: 12,
        marginTop: 8,
        overflow: 'hidden'
    },
    contentError: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12
    }
});