import { decode } from "base-64";
import React, { PureComponent } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, List, overlay, Text } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { RecordData } from "../Scripts/ApiTecnica/types";
import { decode as utf8decode } from "utf8";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";
import { urlBase } from "../Scripts/ApiTecnica";
import { ThemeContext } from "../Components/ThemeProvider";

const useUtf8 = (string: string)=>{
    try {
        return utf8decode(string);
    } catch {
        return string;
    }
};

type IProps = {};
type IState = {
    visible: boolean;
    datas: RecordData;
};

export default class ViewDetailsRecord extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            datas: this.defaultDatas
        };
        this.close = this.close.bind(this);
    }
    private defaultDatas: RecordData = {
        id: '',
        movent: '',
        date: '',
        hour: '',
        importance: '',
        admin: {
            ok: true,
            cause: '',
            datas: {
                id: '',
                name: '',
                position: '',
                username: '',
                picture: '',
            }
        },
        type: '',
        section: ''
    };
    static contextType = ThemeContext;
    open(datas: RecordData) {
        this.setState({
            visible: true,
            datas
        });
    }
    close() {
        this.setState({ visible: false });
    }
    getImpotance() {
        if (!this.state.datas) return 'Ninguna';
        switch (parseInt(this.state.datas!.importance)) {
            case 1:
                return "Alta";
            case 2:
                return "Media";
            case 3:
                return "Normal";
            case 2:
                return "Baja";
        }
        return "Ninguna";
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close} animationIn={'slideInLeft'} animationOut={'slideOutRight'}>
            <View style={[styles.content, { backgroundColor: (isDark)? overlay(1, theme.colors.surface): theme.colors.background }]}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={this.close} />
                    <Appbar.Content title={`Ver detalles: #${this.state.datas.id}`} />
                </Appbar.Header>
                <View style={styles.content2}>
                    <TextView title={'ID'} text={`#${this.state.datas.id}`} />
                    <TextView title={'Tipo'} text={useUtf8(decode(this.state.datas.type))} />
                    <TextViewDetails title={'Detalles'} text={useUtf8(decode(this.state.datas.movent))} />
                    <TextView title={'Fecha'} text={decode(this.state.datas.date)} />
                    <TextView title={'Hora'} text={decode(this.state.datas.hour)} />
                    <TextView title={'Sector'} text={useUtf8(decode(this.state.datas.section))} />
                    <TextView title={'Importancia'} text={this.getImpotance()} />
                    <TextView title={'Responsable'} text={''} />
                    <View style={{ marginLeft: 20, marginTop: 4 }}>
                        <List.Item
                            title={useUtf8(decode(this.state.datas.admin.datas.name))}
                            description={`@${useUtf8(decode(this.state.datas.admin.datas.username))}`}
                            style={{ height: 64 }}
                            left={(props)=><ImageLazyLoad
                                {...props}
                                circle={true}
                                size={48}
                                source={{ uri: `${urlBase}/image/${decode(this.state.datas!.admin.datas.picture)}` }}
                            />}
                            right={(props)=><View style={{ height: '100%', marginRight: 10, justifyContent: 'center' }}>
                                <Text style={{ color: props.color }}>#{this.state.datas!.admin.datas.id}</Text>
                            </View>}
                        />
                    </View>
                </View>
            </View>
        </CustomModal>);
    }
}

type IProps2 = {
    title: string;
    text: string;
};
class TextView extends PureComponent<IProps2> {
    constructor(props: IProps2) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ marginLeft: 14 }}>⦿</Text>
            <Text style={{ marginLeft: 4, fontWeight: 'bold' }}>{`${this.props.title}:`}</Text>
            <Text style={{ marginLeft: 4 }}>{this.props.text}</Text>
        </View>);
    }
}

type IProps3 = {
    title: string;
    text: string;
};
class TextViewDetails extends PureComponent<IProps3> {
    constructor(props: IProps3) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={{ flexDirection: 'column', marginTop: 4 }}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ marginLeft: 14 }}>⦿</Text>
                <Text style={{ marginLeft: 4, fontWeight: 'bold' }}>{`${this.props.title}:`}</Text>
            </View>
            <Text style={{ marginLeft: 30, marginEnd: 8 }}>{this.props.text}</Text>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        position: 'relative',
        borderRadius: 8,
        marginLeft: 10,
        marginRight: 10,
        //backgroundColor: Theme.colors.background,
        overflow: 'hidden'
    },
    content2: {
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 12,
        paddingBottom: 12,
        flexDirection: 'column'
    }
});