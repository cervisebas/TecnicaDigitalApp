import { decode } from "base-64";
import React, { PureComponent } from "react";
import { FlatList, ListRenderItemInfo, NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData, View } from "react-native";
import { Appbar, Divider, Provider as PaperProvider, Searchbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomModal from "../Components/CustomModal";
import ItemStudent from "../Components/Elements/CustomItem";
import { urlBase } from "../Scripts/ApiTecnica";
import { StudentsData } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";

type IProps = {
    openDetails: (data: StudentsData)=>any;
    onEdit: (data: StudentsData)=>any;
    onDelete: (userId: string)=>any;
};
type IState = {
    visible: boolean;
    list: StudentsData[];
    listShow: StudentsData[];
    searchQuery: string;
};

export default class SearchStudents extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            list: [],
            listShow: [],
            searchQuery: ''
        };
        this._renderItem = this._renderItem.bind(this);
        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.goSearch = this.goSearch.bind(this);
        this.close = this.close.bind(this);
    }
    
    // Search
    onChangeSearch(Query: string) {
        if (this.state.searchQuery.length > Query.length) return this.setState({ searchQuery: Query, listShow: this.state.list });
        this.setState({ searchQuery: Query });
    }
    goSearch(event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        const { nativeEvent: { text } } = event;
        if (text.indexOf('#') !== -1) if (parseInt(text) !== NaN) return this.goSearchForID(event);
        this.goSearchForName(event);
    }
    goSearchForID({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        const formattedQuery = text.slice(1, text.length);
        const search = this.state.list.filter((user)=>user.id == formattedQuery);
        this.setState({ listShow: search });
    }
    goSearchForName({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        const formattedQuery = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trimStart().trimEnd();
        const search = this.state.list.filter((user)=>{
            var name1 = decode(user.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return name1.indexOf(formattedQuery) !== -1;
        });
        this.setState({ listShow: search });
    }

    // Flatlist
    _keyExtractor(item: StudentsData) {
        return `p3-list-item-${item.id}`;
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }
    _renderItem({ item }: ListRenderItemInfo<StudentsData>) {
        return(<ItemStudent
            key={`s1-item-${item.id}`}
            source={{ uri: `${urlBase}/image/${decode(item.picture)}` }}
            title={decode(item.name)}
            noLine={true}
            onPress={()=>this.props.openDetails(item)}
            onEdit={()=>this.props.onEdit(item)}
            onDelete={()=>this.props.onDelete(item.id)}
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
    open(list: StudentsData[]) {
        this.setState({
            visible: true,
            list,
            listShow: list
        });
    }
    close() {
        this.setState({
            visible: false,
            list: []
        });
    }

    render(): React.ReactNode {
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <PaperProvider theme={Theme}>
                <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={'Buscar estudiante'}  />
                    </Appbar.Header>
                    <View style={{ flex: 2 }}>
                        <View style={styles.viewSearchbar}>
                            <CustomSearchbar
                                onEmpty={()=>this.setState({ listShow: this.state.list })}
                                onSubmit={this.goSearch}
                            />
                        </View>
                        <FlatList
                            data={this.state.listShow}
                            extraData={this.state}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            contentContainerStyle={[styles.listStyle, { flex: (this.state.listShow.length == 0)? 3: undefined }]}
                            ListEmptyComponent={<ListEmpty />}
                            renderItem={this._renderItem}
                        />
                    </View>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}

class ListEmpty extends PureComponent {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactNode {
        return(<View style={styles.emptyContain}>
            <Icon name={'account-search-outline'} size={48} />
            <Text style={{ marginTop: 12 }}>No se encontraron resultados</Text>
        </View>);
    }
}

type IProps2 = {
    onEmpty: ()=>any;
    onSubmit: (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>)=>any;
};
type IState2 = {
    searchQuery: string;
};
class CustomSearchbar extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            searchQuery: ''
        };
        this.onChangeSearch = this.onChangeSearch.bind(this);
    }
    onChangeSearch(Query: string) {
        if (this.state.searchQuery.length > Query.length) return this.setState({ searchQuery: Query }, this.props.onEmpty);
        this.setState({ searchQuery: Query });
    }
    render(): React.ReactNode {
        return(<Searchbar
            value={this.state.searchQuery}
            style={styles.searchbar}
            placeholder={'Escribe para buscar...'}
            onChangeText={this.onChangeSearch}
            onSubmitEditing={this.props.onSubmit}
        />);
    }
}

const styles = StyleSheet.create({
    searchbar: {
        marginTop: 8,
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 12
    },
    viewLoading: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    viewSearchbar: {
        backgroundColor: Theme.colors.primary,
        marginTop: -8
    },
    listStyle: {
        paddingTop: 4
    },
    emptyContain: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    }
});