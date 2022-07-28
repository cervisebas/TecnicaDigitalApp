import { decode } from "base-64";
import React, { Component } from "react";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import { ActivityIndicator, Appbar, Divider, Provider as PaperProvider, Searchbar } from "react-native-paper";
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
    isLoading: boolean;
};

export default class SearchStudents extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            list: undefined,
            searchQuery: '',
            isLoading: false
        };
        this._renderItem = this._renderItem.bind(this);
    }
    componentDidUpdate() {
        if (this.props.visible) {
            if (this.state.list == undefined) this.setState({ list: this.props.list });
        } else {
            if (this.state.list) this.setState({ list: undefined });
            if (this.state.searchQuery.length !== 0) this.setState({ searchQuery: '' });
            if (this.state.isLoading) this.setState({ isLoading: false });
        }
    }
    
    /* ##### Search ##### */
    onChangeSearch(Query: string) {
        if (this.state.searchQuery.length > Query.length) return this.setState({ searchQuery: Query, list: this.props.list });
        this.setState({ searchQuery: Query });
    }
    goSearch(Query: string) {
        this.setState({ isLoading: true }, ()=>{
            const formattedQuery = Query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trimStart().trimEnd();
            const search = this.props.list.filter((user)=>{
                var name1 = decode(user.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return name1.indexOf(formattedQuery) !== -1;
            });
            this.setState({ list: search, isLoading: false });
        });
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
    _getItemLayout(data: StudentsData[] | null | undefined, index: number) {
        return {
            length: 64,
            offset: 64 * data!.length,
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
                        {(!this.state.isLoading)? (this.state.list)&&<FlatList
                            data={this.state.list}
                            extraData={this.state}
                            keyExtractor={this._keyExtractor}
                            getItemLayout={this._getItemLayout}
                            ItemSeparatorComponent={this._ItemSeparatorComponent}
                            ListHeaderComponent={<Searchbar
                                value={this.state.searchQuery}
                                style={{ marginTop: 8, marginLeft: 8, marginRight: 8, marginBottom: 12 }}
                                placeholder={'Escribe para buscar...'}
                                onChangeText={(query: string)=>this.onChangeSearch(query)}
                                onSubmitEditing={({ nativeEvent })=>this.goSearch(nativeEvent.text)}
                            />}
                            renderItem={this._renderItem}
                        />: <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator animating size={'large'} />
                        </View>}
                    </View>
                </View>
            </PaperProvider>
        </CustomModal>);
    }
}