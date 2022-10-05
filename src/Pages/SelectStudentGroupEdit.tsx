import { decode, encode } from "base-64";
import React, { Component, ReactNode } from "react";
import { DeviceEventEmitter, FlatList, ListRenderItemInfo, Pressable, StyleSheet, ToastAndroid, View } from "react-native";
import { Appbar, Button, Checkbox, Colors, Dialog, Divider, FAB, List, Paragraph, Portal, Provider as PaperProvider, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomModal from "../Components/CustomModal";
import ImageLazyLoad from "../Components/Elements/ImageLazyLoad";
import { ThemeContext } from "../Components/ThemeProvider";
import { Groups, urlBase } from "../Scripts/ApiTecnica";
import { StudentsData } from "../Scripts/ApiTecnica/types";

type IProps = {
    showLoading: (v: boolean, t: string, a?: ()=>any)=>any;
    showSnackbar: (t: string, a?: ()=>any)=>any;
    openImage: (source: string, text: string)=>any;
};
type IState = {
    visible: boolean;
    dataStudents: StudentsData[];
    isMenuOpen: boolean;
    isLoading: boolean;
    id: string;
    dataLog: {
        id: string;
        check: boolean;
    }[];
    after: StudentsData[];
    alertVisible: boolean;
    alertMessage: string;
};

export default class SelectStudentGroupEdit extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            dataStudents: [],
            isMenuOpen: false,
            isLoading: false,
            id: '',
            dataLog: [],
            after: [],
            alertVisible: false,
            alertMessage: ''
        };
        this.closeAndClean = this.closeAndClean.bind(this);
        this.loadData = this.loadData.bind(this);
        this.send = this.send.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._closeAlert = this._closeAlert.bind(this);
    }
    static contextType = ThemeContext;
    checkAction(id: string, index: number) {
        let dataLog = this.state.dataLog;
        dataLog[index] = {
            check: (dataLog[index])? !dataLog[index].check: true,
            id
        };
        this.setState({ dataLog: dataLog });
    }
    loadData() {
        this.setState({
            dataLog: this.state.dataStudents.map((s)=>({
                check: !!this.state.after.find((v)=>v.id == s.id),
                id: s.id
            }))
        });
    }
    closeAndClean() {
        if (this.state.isLoading) return ToastAndroid.show('Todavia no se puede cerrar.', ToastAndroid.SHORT);
        this.setState({ dataStudents: [], dataLog: [] });
        this.close();
    }
    send() {
        var students = this.state.dataLog.filter((v)=>!!v.check).map((v)=>v.id);
        if (students.length == 0) return ToastAndroid.show('No se selecciono ningún estudiante en la lista...', ToastAndroid.SHORT);
        this.setState({ isLoading: true }, ()=>
            Groups.modify(this.state.id, undefined, undefined, encode(JSON.stringify(students)))
                .then(()=>this.setState({ isLoading: false }, ()=>{
                    DeviceEventEmitter.emit('p6-reload', undefined, true);
                    DeviceEventEmitter.emit('p1-reload', undefined, true);
                    this.props.showSnackbar('Se edito correctamente el grupo.', this.closeAndClean);
                }))
                .catch((error)=>this.setState({ isLoading: false }, ()=>this.setState({ alertVisible: true, alertMessage: error.cause })))
        );
    }

    // Flatlist
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    _keyExtractor({ id }: StudentsData) {
        return `confirm-assist-${id}`;
    }
    _renderItem({ item, index }: ListRenderItemInfo<StudentsData>) {
        return(<List.Item
            key={`conf-assist-${item.id}`}
            title={decode(item.name)}
            disabled={this.state.isLoading}
            onPress={()=>this.checkAction(item.id, index)}
            style={styles.items}
            left={(props)=><Pressable {...props} style={{ justifyContent: 'center', alignItems: 'center' }} onPress={()=>this.props.openImage(`${urlBase}/image/${decode(item.picture)}`, decode(item.name))}>
                <ImageLazyLoad
                    size={48}
                    circle
                    source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
                />
            </Pressable>}
            right={()=><View style={{ justifyContent: 'center' }}>
                <Checkbox
                    color={Colors.blue500}
                    uncheckedColor={Colors.red500}
                    disabled={this.state.isLoading}
                    status={(this.state.dataLog[index])? (this.state.dataLog[index].check)? 'checked': 'unchecked': 'unchecked'}
                    onPress={()=>this.checkAction(item.id, index)} />
            </View>}
        />);
    }
    _getItemLayout(_data: StudentsData[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * index,
            index
        };
    }

    // Controller
    open(id: string, dataStudents: StudentsData[], after: StudentsData[]) {
        this.setState({
            visible: true,
            id,
            dataStudents,
            after
        });
    }
    close() {
        this.setState({
            visible: false,
            dataStudents: [],
            dataLog: []
        });
    }

    // New's
    _closeAlert() {
        this.setState({ alertVisible: false });
    }

    render(): ReactNode {
        const { theme } = this.context;
        return(<CustomModal visible={this.state.visible} onShow={this.loadData} onRequestClose={this.closeAndClean}>
            <PaperProvider theme={theme}>
                <View style={{ flex: 1 }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.closeAndClean} />
                        <Appbar.Content title={'Selecciona los alumnos'} />
                    </Appbar.Header>
                    <View style={{ flex: 2, backgroundColor: theme.colors.background }}>
                        <FlatList
                            data={this.state.dataStudents}
                            extraData={this.state}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            contentContainerStyle={{ paddingBottom: 80, flex: (this.state.dataStudents.length == 0)? 2: undefined }}
                            ListEmptyComponent={()=><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún estudiante</Text></View>}
                            renderItem={this._renderItem}
                        />
                    </View>
                    <FAB
                        icon={'send'}
                        label={(this.state.isLoading)? 'ENVIANDO': 'ENVIAR'}
                        onPress={(!this.state.isLoading)? this.send: undefined}
                        loading={this.state.isLoading}
                        style={styles.fab}
                    />
                    <Portal>
                        <Dialog visible={this.state.alertVisible} onDismiss={this._closeAlert}>
                            <Dialog.Title>¡¡¡Atención!!!</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>{this.state.alertMessage}</Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={this._closeAlert}>Cerrar</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        marginBottom: 16,
        marginLeft: 96,
        marginRight: 96
    },
    items: {
        height: 64
    }
});