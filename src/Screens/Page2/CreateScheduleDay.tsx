import { Picker } from "@react-native-picker/picker";
import { decode } from "base-64";
import React, { createRef, PureComponent } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Divider, Text } from "react-native-paper";
import { CustomPicker2 } from "../../Components/Elements/CustomInput";
import { Matter, Schedule } from "../../Scripts/ApiTecnica/types";

type IProps = {
    matters: Matter[];
    disabled: boolean;
};
type IState = {};

type HourResult = {
    group: string;
    matter: string;
};
export type DayResult = {
    hour: string;
    group: string;
    matter: string;
};

export default class CreateScheduleDay extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    // Ref's
    private refFirst = createRef<ElementHour>();
    private refSecond = createRef<ElementHour>();
    private refThird = createRef<ElementHour>();
    private refFourth = createRef<ElementHour>();
    private refFirst2 = createRef<ElementHour>();
    private refSecond2 = createRef<ElementHour>();
    private refThird2 = createRef<ElementHour>();
    private refFourth2 = createRef<ElementHour>();

    clear() {
        this.refFirst.current?.clear();
        this.refSecond.current?.clear();
        this.refThird.current?.clear();
        this.refFourth.current?.clear();
        this.refFirst2.current?.clear();
        this.refSecond2.current?.clear();
        this.refThird2.current?.clear();
        this.refFourth2.current?.clear();
    }
    set(datas: Schedule[]): void {
        this.refFirst.current?.set(datas.filter((v)=>v.hour == '7:15'));
        this.refSecond.current?.set(datas.filter((v)=>v.hour == '8:40'));
        this.refThird.current?.set(datas.filter((v)=>v.hour == '9:50'));
        this.refFourth.current?.set(datas.filter((v)=>v.hour == '11:00'));
        this.refFirst2.current?.set(datas.filter((v)=>v.hour == '13:15'));
        this.refSecond2.current?.set(datas.filter((v)=>v.hour == '14:25'));
        this.refThird2.current?.set(datas.filter((v)=>v.hour == '15:35'));
        this.refFourth2.current?.set(datas.filter((v)=>v.hour == '16:45'));
    }
    get(): DayResult[] {
        const first = this.refFirst.current?.get();
        const second = this.refSecond.current?.get();
        const third = this.refThird.current?.get();
        const fourth = this.refFourth.current?.get();

        const first2 = this.refFirst2.current?.get();
        const second2 = this.refSecond2.current?.get();
        const third2 = this.refThird2.current?.get();
        const fourth2 = this.refFourth2.current?.get();
        
        const result: DayResult[] = [];
        first!.forEach((values)=>result.push({ ...values, hour: '7:15' }));
        second!.forEach((values)=>result.push({ ...values, hour: '8:40' }));
        third!.forEach((values)=>result.push({ ...values, hour: '9:50' }));
        fourth!.forEach((values)=>result.push({ ...values, hour: '11:00' }));
        
        first2!.forEach((values)=>result.push({ ...values, hour: '13:15' }));
        second2!.forEach((values)=>result.push({ ...values, hour: '14:25' }));
        third2!.forEach((values)=>result.push({ ...values, hour: '15:35' }));
        fourth2!.forEach((values)=>result.push({ ...values, hour: '16:45' }));

        return result;
    }
    render(): React.ReactNode {
        return(<View style={styles.content}>
            <ScrollView>
                <View style={{ height: 80, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Turno mañana</Text>
                </View>
                
                <ElementHour disabled={this.props.disabled} ref={this.refFirst} title={'Primera hora (7:15hs):'} matters={this.props.matters} />
                <ElementHour disabled={this.props.disabled} ref={this.refSecond} title={'Segunda hora (8:40hs):'} matters={this.props.matters} />
                <ElementHour disabled={this.props.disabled} ref={this.refThird} title={'Tercera hora (9:50hs):'} matters={this.props.matters} />
                <ElementHour disabled={this.props.disabled} ref={this.refFourth} title={'Cuarta hora (11:00hs):'} matters={this.props.matters} />
                
                <View style={{ height: 80, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Turno tarde</Text>
                </View>
                
                <ElementHour disabled={this.props.disabled} ref={this.refFirst2} title={'Primera hora (13:15hs):'} matters={this.props.matters} />
                <ElementHour disabled={this.props.disabled} ref={this.refSecond2} title={'Segunda hora (14:25hs):'} matters={this.props.matters} />
                <ElementHour disabled={this.props.disabled} ref={this.refThird2} title={'Tercera hora (15:35hs):'} matters={this.props.matters} />
                <ElementHour disabled={this.props.disabled} ref={this.refFourth2} title={'Cuarta hora (16:45hs):'} matters={this.props.matters} />

                <View style={{ marginBottom: 12 }} />
            </ScrollView>
        </View>);
    }
}

type IProps2 = {
    title: string;
    disabled: boolean;
    matters: Matter[];
};
type IState2 = {
    group1: string;
    slot1: string;
    group2: string;
    slot2: string;
    disabled2: boolean;
};

class ElementHour extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            group1: '',
            slot1: '',
            group2: '',
            slot2: '',
            disabled2: true
        };
    }
    private listGroup: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    componentDidUpdate(): void {
        if (this.state.group1 !== '' && this.state.slot1 !== '' && this.state.group1 !== 'none') this.setState({ disabled2: false });
        if (this.state.group1 == '' || this.state.slot1 == '' || this.state.group1 == 'none') this.setState({ disabled2: true });
    }
    clear() {
        this.setState({
            group1: '',
            slot1: '',
            group2: '',
            slot2: '',
            disabled2: true
        });
    }
    set(datas: Schedule[]): void {
        if (datas[1] !== undefined) return this.setState({
            group1: datas[0].group,
            slot1: (datas[0].matter == 'none')? 'none': datas[0].matter.id,
            group2: datas[1].group,
            slot2: (datas[1].matter == 'none')? 'none': datas[1].matter.id,
            disabled2: false
        });
        this.setState({
            group1: datas[0].group,
            slot1: (datas[0].matter == 'none')? 'none': datas[0].matter.id
        });
    }
    get(): HourResult[] {
        var result: HourResult[] = [];
        if (this.state.group1 !== '' && this.state.slot1 !== '') result.push({ group: this.state.group1, matter: this.state.slot1 });
        if (this.state.group2 !== '' && this.state.slot2 !== '') result.push({ group: this.state.group2, matter: this.state.slot2 });
        return result;
    }
    render(): React.ReactNode {
        return(<View style={styles.contentElement}>
            <Text style={{ marginLeft: 8, marginBottom: 4, fontSize: 16, fontWeight: '700' }}>{this.props.title}</Text>
            <CustomPicker2 disabled={this.props.disabled} title={'Grupo'} value={this.state.group1} style={styles.picker} onChange={(group1)=>this.setState({ group1 })}>
                <Picker.Item label={'- Seleccionar -'} value={''} color={'#000000'} />
                <Picker.Item label={'Ninguno'} value={'none'} color={'#000000'} />
                {this.listGroup.map((value, index)=><Picker.Item
                    key={index.toString()}
                    label={value}
                    value={value}
                    color={'#000000'}
                />)}
            </CustomPicker2>
            <CustomPicker2 disabled={this.props.disabled} title={'Materia'} value={this.state.slot1} style={styles.picker} onChange={(slot1)=>this.setState({ slot1 })}>
                <Picker.Item label={'- Seleccionar -'} value={''} color={'#000000'} />
                <Picker.Item label={'Libre'} value={'none'} color={'#000000'} />
                {this.props.matters.map((value, index)=><Picker.Item
                    key={index.toString()}
                    label={`${decode(value.name)} - ${decode(value.teacher.name)}`}
                    value={value.id}
                    color={'#000000'}
                />)}
            </CustomPicker2>
            <CustomPicker2 disabled={this.props.disabled || this.state.disabled2} title={'Grupo'} value={this.state.group2} style={[styles.picker, { marginTop: 14 }]} onChange={(group2)=>this.setState({ group2 })}>
                <Picker.Item label={'- Seleccionar -'} value={''} color={'#000000'} />
                <Picker.Item label={'Ninguno'} value={'none'} color={'#000000'} />
                {this.listGroup.map((value, index)=><Picker.Item
                    key={index.toString()}
                    label={value}
                    value={value}
                    color={'#000000'}
                />)}
            </CustomPicker2>
            <CustomPicker2 disabled={this.props.disabled || this.state.disabled2} title={'Materia'} value={this.state.slot2} style={styles.picker} onChange={(slot2)=>this.setState({ slot2 })}>
                <Picker.Item label={'- Seleccionar -'} value={''} color={'#000000'} />
                <Picker.Item label={'Libre'} value={'none'} color={'#000000'} />
                {this.props.matters.map((value, index)=><Picker.Item
                    key={index.toString()}
                    label={`${decode(value.name)} - ${decode(value.teacher.name)}`}
                    value={value.id}
                    color={'#000000'}
                />)}
            </CustomPicker2>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    contentElement: {
        marginTop: 12
    },
    picker: {
        marginTop: 4,
        marginLeft: 8,
        marginRight: 8
    }
});