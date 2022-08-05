import { decode } from "base-64";
import React, { PureComponent } from "react";
import { FlatList, ListRenderItemInfo, NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData, View } from "react-native";
import { Appbar, Divider, ProgressBar, Provider as PaperProvider, Searchbar } from "react-native-paper";
import CustomModal from "../Components/CustomModal";
import ItemStudent from "../Components/Elements/CustomItem";
import { urlBase } from "../Scripts/ApiTecnica";
import { StudentsData } from "../Scripts/ApiTecnica/types";
import Theme from "../Themes";

type IProps = {
    visible: boolean;
    close: ()=>any;
    list: StudentsData[];
    openDetails: (data: StudentsData)=>any;
    onEdit: (data: StudentsData)=>any;
    onDelete: (userId: string)=>any;
};
type IState = {
    list: StudentsData[] | undefined;
    searchQuery: string;
};

export default class SearchStudents extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            list: undefined,
            searchQuery: ''
        };
        this._renderItem = this._renderItem.bind(this);
        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.goSearch = this.goSearch.bind(this);
    }
    componentDidUpdate() {
        if (this.props.visible) {
            if (this.state.list == undefined) this.setState({ list: this.props.list });
        } else {
            if (this.state.list) this.setState({ list: undefined });
            if (this.state.searchQuery.length !== 0) this.setState({ searchQuery: '' });
        }
    }
    
    /* ##### Search ##### */
    onChangeSearch(Query: string) {
        if (this.state.searchQuery.length > Query.length) return this.setState({ searchQuery: Query, list: this.props.list });
        this.setState({ searchQuery: Query });
    }
    goSearch({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        const formattedQuery = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trimStart().trimEnd();
        const search = this.props.list.filter((user)=>{
            var name1 = decode(user.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return name1.indexOf(formattedQuery) !== -1;
        });
        this.setState({ list: search });
    }
    /* ################## */

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

    render(): React.ReactNode {
        return(<CustomModal visible={this.props.visible} onRequestClose={this.props.close}>
            <PaperProvider theme={Theme}>
                <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.props.close} />
                        <Appbar.Content title={'Buscar estudiante'}  />
                    </Appbar.Header>
                    <View style={{ flex: 2 }}>
                        <View style={styles.viewSearchbar}>
                            <CustomSearchbar
                                onEmpty={()=>this.setState({ list: this.props.list })}
                                onSubmit={this.goSearch}
                            />
                        </View>
                        {(this.state.list)&&<FlatList
                            data={this.state.list}
                            extraData={this.state}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            contentContainerStyle={styles.listStyle}
                            renderItem={this._renderItem}
                        />}
                    </View>
                </View>
            </PaperProvider>
        </CustomModal>);
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
    }
});