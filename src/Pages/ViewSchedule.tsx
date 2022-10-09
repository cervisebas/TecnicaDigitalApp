import React, { createRef, PureComponent } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Button, Dialog, Paragraph, Portal, Text, TouchableRipple, Provider as PaperProvider } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { ThemeContext } from "../Components/ThemeProvider";
import { DataSchedule, Matter, Schedule } from "../Scripts/ApiTecnica/types";
import { Table, TableWrapper, Row, Rows, Col } from 'react-native-table-component';
import { decode } from "base-64";

type IProps = {};
type IState = {
    visible: boolean;
    rows1: string[][];
    rows2: string[][];
    curse: string;
};

export default class ViewSchedule extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            rows1: [],
            rows2: [],
            curse: '0°0'
        };
        this.close = this.close.bind(this);
    }
    static contextType = ThemeContext;
    private days = ['', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];
    private morning = ['7:30\nA\n8:30', '8:40\nA\n9:40', '9:50\nA\n10:50', '11:00\nA\n12:00'];
    private afternoon = ['13:15\nA\n14:15', '14:25\nA\n15:25', '15:35\nA\n16:35', '16:45\nA\n17:45'];
    private height: number = 80;
    private width: number = 120;
    private refDialogDetails = createRef<DialogDetails>();

    private openDialog(isGroups: boolean, datas?: Schedule | Schedule[]) {
        if (isGroups) {
            const dataGroups = (datas as Schedule[]);
            return this.refDialogDetails.current?.open(true,
                dataGroups[0].group, dataGroups[0].matter as Matter,
                dataGroups[1].group, dataGroups[1].matter as Matter
            );
        }
        const oneGroup = datas as Schedule;
        this.refDialogDetails.current?.open(false, oneGroup.group, oneGroup.matter as Matter);
    }
    private getItemGroup(group1: string, matter1: string, data1: Schedule, group2: string, matter2: string, data2: Schedule) {
        const { theme } = this.context;
        return(<TouchableRipple style={{ flexDirection: 'column' }} onPress={()=>this.openDialog(true, [data1, data2])}>
            <View>
                <View style={{ width: '100%', height: 39, borderBottomWidth: 1, borderBottomColor: theme.colors.text, justifyContent: 'center', paddingLeft: 4, paddingRight: 2 }}>
                    <Text numberOfLines={1} style={{ fontSize: 12 }}>Grupo {group1}: {matter1}</Text>
                </View>
                <View style={{ width: '100%', height: 39, borderTopWidth: 1, borderTopColor: theme.colors.text, justifyContent: 'center', paddingLeft: 4, paddingRight: 2 }}>
                    <Text numberOfLines={1} style={{ fontSize: 12 }}>Grupo {group2}: {matter2}</Text>
                </View>
            </View>
        </TouchableRipple>);
    }
    private getItem(matter: string, data: Schedule) {
        return(<TouchableRipple style={{ flexDirection: 'column' }} onPress={()=>this.openDialog(false, data)}>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>{matter}</Text>
            </View>
        </TouchableRipple>);
    }
    private getItemDefault(matter: string) {
        return(<View style={{ flexDirection: 'column' }}>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16 }}>{matter}</Text>
            </View>
        </View>);
    }
    processData(datas: Schedule[]) {
        const morning: Schedule[] = [];
        const afternoon: Schedule[] = [];
        
        const time1 = ['7:15', '8:40', '9:50', '11:00'];
        const time2 = ['13:15', '14:25', '15:35', '16:45'];
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

        datas.forEach((data)=>{
            if (time1.find((v)=>v == data.hour) !== undefined)
                morning.push(data);
            else if (time2.find((v)=>v == data.hour) !== undefined)
                afternoon.push(data);
        });

        const rows1_2: string[][] = [];
        const useIndex1: number[] = [];
        morning.forEach((data, index)=>{
            if (useIndex1.findIndex((v)=>v == index) !== -1) return;

            const timeIndex = time1.findIndex((v)=>v == data.hour);
            const dayIndex = days.findIndex((v)=>v == data.day);

            var group2 = morning.findIndex((data2, index2)=>data.hour == data2.hour && index !== index2 && data2.group !== 'none' && data.day == data2.day);
            var isGroup = group2 !== -1;

            var text: string | React.ReactNode = '';
            if (isGroup) {
                text = this.getItemGroup(
                    data.group, (data.matter == 'none')? 'Libre': decode(data.matter.name), data,
                    morning[group2].group, (morning[group2].matter == 'none')? 'Libre': decode((morning[group2].matter as any).name), morning[group2]
                );
                useIndex1.push(group2);
            } else text = (data.matter == 'none')? this.getItemDefault('Libre'): this.getItem(decode(data.matter.name), data);

            if (rows1_2[dayIndex] == undefined) {
                const newArray: string[] = [];
                newArray[timeIndex] = text as any;
                return rows1_2[dayIndex] = newArray;
            }
            rows1_2[dayIndex][timeIndex] = text as any;
        });
        const rows1: string[][] = [];
        for (let i = 0; i < 4; i++) {
            rows1[i] = [
                rows1_2[0][i],
                rows1_2[1][i],
                rows1_2[2][i],
                rows1_2[3][i],
                rows1_2[4][i]
            ];
        }

        const rows2_2: string[][] = [];
        const useIndex2: number[] = [];
        afternoon.forEach((data, index)=>{
            if (useIndex2.findIndex((v)=>v == index) !== -1) return;

            const timeIndex = time2.findIndex((v)=>v == data.hour);
            const dayIndex = days.findIndex((v)=>v == data.day);

            var group2 = afternoon.findIndex((data2, index2)=>data.hour == data2.hour && index !== index2 && data2.group !== 'none' && data.day == data2.day);
            var isGroup = group2 !== -1;

            var text: string | React.ReactNode = '';
            if (isGroup) {
                text = this.getItemGroup(
                    data.group, (data.matter == 'none')? 'Libre': decode(data.matter.name), data,
                    afternoon[group2].group, (afternoon[group2].matter == 'none')? 'Libre': decode((afternoon[group2].matter as any).name), afternoon[group2]
                );
                useIndex2.push(group2);
            } else text = (data.matter == 'none')? this.getItemDefault('Libre'): this.getItem(decode(data.matter.name), data);

            if (rows2_2[dayIndex] == undefined) {
                const newArray: string[] = [];
                newArray[timeIndex] = text as any;
                return rows2_2[dayIndex] = newArray;
            }
            rows2_2[dayIndex][timeIndex] = text as any;
        });
        const rows2: string[][] = [];
        for (let i = 0; i < 4; i++) {
            rows2[i] = [
                rows2_2[0][i],
                rows2_2[1][i],
                rows2_2[2][i],
                rows2_2[3][i],
                rows2_2[4][i]
            ];
        }

        this.setState({ rows1, rows2 });
    }

    // Controller
    open(data: DataSchedule) {
        this.setState({ visible: true, curse: decode(data.curse) });
        this.processData(data.data);
    }
    close() {
        if (this.refDialogDetails.current?.state.visible) return this.refDialogDetails.current.close();
        this.setState({ visible: false });
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <PaperProvider theme={theme}>
                <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={`Horario ${this.state.curse}`} />
                    </Appbar.Header>
                    <ScrollContent>
                        <View style={styles.container}>
                        <Table borderStyle={{ borderWidth: 2, borderColor: theme.colors.text }}>
                            <Row data={['Turno mañana']} style={(isDark)? styles.title1cDark: styles.title1c} textStyle={[styles.title1, { color: theme.colors.text }]} />
                            <Row
                                data={this.days}
                                style={(isDark)? styles.headDark: styles.head}
                                widthArr={[80, this.width, this.width, this.width, this.width, this.width]}
                                textStyle={[styles.textHead, { color: theme.colors.text }]}
                            />
                            <TableWrapper style={styles.wrapper}>
                                <Col
                                    data={this.morning}
                                    style={(isDark)? styles.titleDark: styles.title}
                                    heightArr={[this.height, this.height, this.height, this.height]}
                                    width={80}
                                    textStyle={[styles.textTitle, { color: theme.colors.text }]}
                                />
                                <Rows
                                    data={this.state.rows1}
                                    widthArr={[this.width, this.width, this.width, this.width, this.width]}
                                    heightArr={[this.height, this.height, this.height, this.height]}
                                />
                            </TableWrapper>
                            <Row data={['Turno tarde']} style={(isDark)? styles.title1cDark: styles.title1c} textStyle={[styles.title1, { color: theme.colors.text }]} />
                            <Row
                                data={this.days}
                                style={(isDark)? styles.headDark: styles.head}
                                widthArr={[80, this.width, this.width, this.width, this.width, this.width]}
                                textStyle={[styles.textHead, { color: theme.colors.text }]}
                            />
                            <TableWrapper style={styles.wrapper}>
                                <Col
                                    data={this.afternoon}
                                    style={(isDark)? styles.titleDark: styles.title}
                                    heightArr={[this.height, this.height, this.height, this.height]}
                                    width={80}
                                    textStyle={[styles.textTitle, { color: theme.colors.text }]}
                                />
                                <Rows
                                    data={this.state.rows2}
                                    widthArr={[this.width, this.width, this.width, this.width, this.width]}
                                    heightArr={[this.height, this.height, this.height, this.height]}
                                />
                            </TableWrapper>
                        </Table>
                        </View>
                    </ScrollContent>
                    <DialogDetails ref={this.refDialogDetails} />
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}

class ScrollContent extends PureComponent {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.content}>
            <ScrollView>
                <ScrollView horizontal={true}>
                    {this.props.children}
                </ScrollView>
            </ScrollView>
        </View>);
    }
}

type IState2 = {
    visible: boolean;
    paragraph: string | React.ReactNode;
};
class DialogDetails extends PureComponent<any, IState2> {
    constructor(props: any) {
        super(props);
        this.state = {
            visible: false,
            paragraph: ''
        };
        this.close = this.close.bind(this);
    }
    close() {
        this.setState({ visible: false });
    }
    open(isGroup: boolean, group1: string, matter1: Matter, group2?: string, matter2?: Matter) {
        if (!isGroup) this.setState({
            visible: true,
            paragraph: (<View style={{ flexDirection: 'column' }}>
                <TextView title={'Materia'} text={decode(matter1.name)} />
                <TextView title={'Profesor'} text={decode(matter1.teacher.name)} />
            </View>)
        });
        else this.setState({
            visible: true,
            paragraph: (<View style={{ flexDirection: 'column', paddingLeft: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 8 }}>Grupo {group1}</Text>
                <TextView title={'Materia'} text={decode(matter1.name)} />
                <TextView title={'Profesor'} text={decode(matter1.teacher.name)} />
                <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 14 }}>Grupo {group2!}</Text>
                <TextView title={'Materia'} text={decode(matter2!.name)} />
                <TextView title={'Profesor'} text={decode(matter2!.teacher.name)} />
            </View>)
        });
    }
    render(): React.ReactNode {
        return(<Portal>
            <Dialog visible={this.state.visible} onDismiss={this.close}>
                <Dialog.Title>Ver más detalles</Dialog.Title>
                <Dialog.Content>
                    {this.state.paragraph}
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={this.close}>Cerrar</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>);
    }
}

type IProps2 = {
    title: string;
    text: string;
    icon?: string;
};
class TextView extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.itemContent}>
            <Text style={styles.item0}>⦿</Text>
            <Text style={styles.item1}>{`${this.props.title}:`}</Text>
            <Text style={styles.item2}>{this.props.text}</Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    container: {
        flex: 2,
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: 12,
        paddingTop: 24
    },
    title1c: {
        backgroundColor: '#6EA9F9'
    },
    title1cDark: {
        backgroundColor: '#4F0800'
    },
    title1: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        paddingTop: 8,
        paddingBottom: 8
    },
    head: {
        height: 52,
        backgroundColor: '#9FC6F9'
    },
    headDark: {
        height: 52,
        backgroundColor: '#7E0303'
    },
    textHead: {
        width: '100%',
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '700'
    },
    wrapper: {
        flexDirection: 'row'
    },
    title: {
        backgroundColor: '#CEE3fC'
    },
    titleDark: {
        backgroundColor: '#B40900'
    },
    textTitle: {
        width: '100%',
        height: '100%',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 16,
        fontWeight: '700'
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    item0: {
        marginLeft: 14
    },
    item1: {
        marginLeft: 4,
        fontWeight: 'bold'
    },
    item2: {
        marginLeft: 2
    }
});