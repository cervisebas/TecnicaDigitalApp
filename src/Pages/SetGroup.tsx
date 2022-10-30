import { decode } from "base-64";
import React, { PureComponent } from "react";
import { Dimensions, FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import { Appbar, Button, Dialog, Divider, List, Paragraph, Portal, Provider } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import { ThemeContext } from "../Components/ThemeProvider";
import { Groups } from "../Scripts/ApiTecnica/types";

type IProps = {
    setFilter: (set: string[])=>any;
};
type IState = {
    visible: boolean;
    datas: Groups[];
    isLoading: boolean;
    actual: Groups;
    confirmView: boolean;
};

const { width } = Dimensions.get("window");

export default class SetGroup extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            datas: [],
            isLoading: false,
            actual: this.defaultActual,
            confirmView: false
        };
        this._renderItem = this._renderItem.bind(this);
        this.close = this.close.bind(this);
        this._closeDialog = this._closeDialog.bind(this);
        this._goSetGroup = this._goSetGroup.bind(this);
    }
    private defaultActual: Groups = {
        id: '',
        curse: '',
        name_group: '',
        students: []
    };
    static contextType = ThemeContext;
    setNow(actual: Groups) {
        this.setState({
            confirmView: true,
            actual
        });
    }

    // Flatlist
    _keyExtractor(item: Groups) {
        return `set-group-${item.id}`;
    }
    _ItemSeparatorComponent() {
        return <Divider />;
    }
    _renderItem({ item }: ListRenderItemInfo<Groups>) {
        return(<List.Item
            key={`set-group-${item.id}`}
            title={`Grupo ${decode(item.name_group)} - ${decode(item.curse)}`}
            style={styles.item}
            onPress={()=>this.setNow(item)}
        />);
    }
    _getItemLayout(_data: Groups[] | null | undefined, index: number) {
        return {
            length: 50,
            offset: 50 * index,
            index
        }
    }
    _closeDialog() {
        this.setState({ confirmView: false });
    }
    _goSetGroup() {
        this.setState({ confirmView: false });
        this.props.setFilter(this.state.actual.students);
        this.close();
    }

    // Controller
    open(datas: Groups[]) {
        this.setState({
            visible: true,
            datas
        });
    }
    close() {
        this.setState({
            visible: false,
            datas: [],
            actual: this.defaultActual
        });
    }
    
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <View style={[styles.content, { backgroundColor: (isDark)? theme.colors.surface: theme.colors.background }]}>
                <Provider theme={theme}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={'Elije el grupo a utilizar'} />
                    </Appbar.Header>
                    <FlatList
                        data={this.state.datas}
                        extraData={this.state}
                        keyExtractor={this._keyExtractor}
                        getItemLayout={this._getItemLayout}
                        contentContainerStyle={{ paddingBottom: 76 }}
                        ItemSeparatorComponent={this._ItemSeparatorComponent}
                        renderItem={this._renderItem}
                    />
                    <Portal>
                        <Dialog visible={this.state.confirmView} onDismiss={this._closeDialog}>
                            <Dialog.Title>Confirmar</Dialog.Title>
                            <Dialog.Content>
                                <Paragraph>¿Estás seguro que quieres aplicar el Grupo {decode(this.state.actual.name_group)} de {decode(this.state.actual.curse)} en el registro seleccionado?</Paragraph>
                            </Dialog.Content>
                            <Dialog.Actions>
                                <Button onPress={this._closeDialog}>Cancelar</Button>
                                <Button onPress={this._goSetGroup}>Aceptar</Button>
                            </Dialog.Actions>
                        </Dialog>
                    </Portal>
                </Provider>
            </View>
        </CustomModal>);
    }
}

const styles = StyleSheet.create({
    content: {
        width: (width - 16),
        marginLeft: 8,
        marginRight: 8,
        height: '90%',
        //backgroundColor: Theme.colors.background,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative'
    },
    item: {
        height: 50
    },
    fab: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        marginBottom: 16,
        marginLeft: 96,
        marginRight: 96
    }
});