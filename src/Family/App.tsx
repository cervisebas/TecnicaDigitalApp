import React, { Component, PureComponent } from "react";
import { View } from "react-native";
import { Appbar, Button, Card, IconButton, ProgressBar, Provider as PaperProvider, Text, Title } from "react-native-paper";
import Theme from "../Themes";

type IProps = {};
type IState = {};

export default class AppFamily extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={Theme}>
                <Appbar.Header>
                    <Appbar.Content
                        title={'TecnicaDigital'} />
                    <Appbar.Action icon={'account-circle-outline'} />
                </Appbar.Header>
                <View style={{ flex: 2 }}>
                    <Card style={{ marginLeft: 12, marginRight: 12, marginTop: 12 }} elevation={3}>
                        <Card.Content style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Title><Text style={{ fontWeight: 'bold' }}>Bienvenid@</Text> Sebástian Cerviño</Title>
                        </Card.Content>
                    </Card>
                    <Card style={{ marginLeft: 12, marginRight: 12, marginTop: 8, overflow: 'hidden' }} elevation={3}>
                        <ProgressBar indeterminate />
                        <Card.Title
                            title={'Asistencia:'}
                            right={(props)=><IconButton
                                {...props}
                                icon={'reload'}
                                color={Theme.colors.accent}
                            />}
                        />
                        <Card.Content>
                            <PointItemList title="Presentes" text={'10'} />
                            <PointItemList title="Aunsentes" text={'10'} />
                            <PointItemList title="Total" text={'10'} />
                        </Card.Content>
                        <Card.Actions style={{ justifyContent: 'flex-end' }}>
                            <Button icon={'account-details'}>Ver detalles</Button>
                        </Card.Actions>
                    </Card>
                </View>
            </PaperProvider>
        </View>);
    }
}

type IProps2 = { title: string; text: string };
class PointItemList extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ marginLeft: 14 }}>⦿</Text>
            <Text style={{ marginLeft: 4, fontWeight: 'bold' }}>{`${this.props.title}:`}</Text>
            <Text style={{ marginLeft: 2 }}>{this.props.text}</Text>
        </View>);
    }
};