import { decode, encode } from "base-64";
import React, { createRef, PureComponent } from "react";
import { FlatList, Keyboard, ListRenderItemInfo, NativeSyntheticEvent, StyleSheet, TextInputSubmitEditingEventData, View } from "react-native";
import { Appbar, Divider, overlay, ProgressBar, Provider as PaperProvider, Searchbar, Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import stringSimilarity from "string-similarity";
import CustomModal from "../Components/CustomModal";
import ItemStudent from "../Components/Elements/CustomItem";
import { ThemeContext } from "../Components/ThemeProvider";
import { urlBase } from "../Scripts/ApiTecnica";
import { StudentsData } from "../Scripts/ApiTecnica/types";
import { orderArray } from "../Scripts/Utils";

type IProps = {
    openDetails: (data: StudentsData)=>any;
    onEdit: (data: StudentsData)=>any;
    onDelete: (userId: string)=>any;
    isLoading?: boolean;
};
type IState = {
    visible: boolean;
    list: StudentsData[];
    listShow: StudentsData[];
    isLoading: number;
};

export default class SearchStudents extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            visible: false,
            list: [],
            listShow: [],
            isLoading: 0
        };
        this._renderItem = this._renderItem.bind(this);
        this.goSearch = this.goSearch.bind(this);
        this.reSearch = this.reSearch.bind(this);
        this.close = this.close.bind(this);
    }
    private refSearchBar = createRef<CustomSearchbar>();
    private TextSearch: string = "";
    static contextType = ThemeContext;
    
    // Search
    goSearch(event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        const { nativeEvent: { text } } = event;
        this.TextSearch = text;
        if (text.indexOf('#') !== -1) if (!isNaN(parseInt(text.slice(1, text.length)))) return this.goSearchForID(event);
        if (text.toLowerCase().indexOf('dni:') !== -1) return this.goSearchForDNI(event);
        this.goSearchForName(event);
    }
    goSearchForID({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        const formattedQuery = text.slice(1, text.length);
        const search = this.state.list.filter((user)=>user.id == formattedQuery);
        this.setState({ listShow: search });
    }
    goSearchForDNI({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        const formattedQuery = text.slice(4, text.length);
        const processQuery = encode(formattedQuery);
        const search = this.state.list.filter((user)=>user.dni == processQuery);
        this.setState({ listShow: search });
    }
    goSearchForName({ nativeEvent: { text } }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        /*const formattedQuery = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trimStart().trimEnd();
        const search = this.state.list.filter((user)=>{
            var name1 = decode(user.name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const similarity = stringSimilarity.compareTwoStrings(name1, formattedQuery);
            return name1.indexOf(formattedQuery) !== -1 || parseFloat(similarity.toFixed(2)) > 0.3;
        });
        this.setState({ listShow: search });*/
        this.setState({ listShow: orderArray(this.state.list, 'name', text) });
    }
    reSearch() {
        this.goSearch({
            nativeEvent: {
                text: this.TextSearch
            }
        } as any);
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
        }, ()=>setTimeout(()=>this.refSearchBar.current?.focus(), 500));
    }
    close() {
        this.setState({
            visible: false,
            list: [],
            isLoading: 0
        });
    }
    updateList(isLoading: boolean, list?: StudentsData[]) {
        if (isLoading == true) return this.setState({ isLoading: (isLoading)? 1: 0 });
        this.setState({
            isLoading: 0,
            list: list!
        }, this.reSearch);
    }

    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<CustomModal visible={this.state.visible} onRequestClose={this.close}>
            <PaperProvider theme={theme}>
                <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                    <Appbar.Header>
                        <Appbar.BackAction onPress={this.close} />
                        <Appbar.Content title={'Buscar estudiante'}  />
                    </Appbar.Header>
                    <View style={{ flex: 2 }}>
                        <View style={[styles.viewSearchbar, { backgroundColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary, borderBottomColor: (isDark)? overlay(4, theme.colors.surface): theme.colors.primary }]}>
                            <CustomSearchbar
                                ref={this.refSearchBar}
                                visible={this.state.visible}
                                onEmpty={()=>this.setState({ listShow: this.state.list })}
                                onSubmit={this.goSearch}
                            />
                        </View>
                        <ProgressBar indeterminate style={{ opacity: (this.props.isLoading)? 1: 0 }} color={theme.colors.accent} />
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
    static contextType = ThemeContext;
    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View style={styles.emptyContain}>
            <Icon name={'account-search-outline'} size={48} color={theme.colors.text} />
            <Text style={{ marginTop: 12 }}>No se encontraron resultados</Text>
        </View>);
    }
}

type IProps2 = {
    visible: boolean;
    disableTextExamples?: boolean;
    disableAutoFocus?: boolean;
    onEmpty: ()=>any;
    onSubmit: (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>)=>any;
};
type IState2 = {
    searchQuery: string;
    placeholder: string;
};
export class CustomSearchbar extends PureComponent<IProps2, IState2> {
    constructor(props: IProps2) {
        super(props);
        this.state = {
            searchQuery: '',
            placeholder: this.writeHere
        };
        this.onChangeSearch = this.onChangeSearch.bind(this);
        this.changePlaceholder = this.changePlaceholder.bind(this);
        this.focus = this.focus.bind(this);
    }
    private writeHere: string = 'Escribe para buscar...';
    private examples: string[] = [
        'Ejemplo: Cerviño o #2',
        'Ejemplo: Saffer o #3',
        'Ejemplo: Zucchelli o #89',
        'Ejemplo: Falabella o #27',
        'Ejemplo: Zapata o #75',
        'Ejemplo: Astor o #110'
    ];
    private ref = createRef<any>();
    private forIndex: number = 0;
    private interval: NodeJS.Timer | undefined = undefined;
    private intervalTime: number = 10000;
    static contextType = ThemeContext;
    componentDidMount(): void {
        if (this.props.visible) this.interval = setInterval(this.changePlaceholder, this.intervalTime);
    }
    componentWillUnmount(): void {
        clearInterval(this.interval);
    }
    componentDidUpdate(): void {
        if (this.props.visible && this.state.searchQuery.length == 0) {
            if (this.interval == undefined) this.interval = setInterval(this.changePlaceholder, this.intervalTime);
        } else if (this.interval !== undefined) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
    focus() {
        setTimeout(()=>this.ref.current?.focus(), 500);
    }
    changePlaceholder() {
        if (this.props.disableTextExamples) return;
        if (!this.props.visible) return (this.state.placeholder !== this.writeHere)&&this.setState({ placeholder: this.writeHere });
        if (this.state.placeholder == this.writeHere) {
            this.setState({ placeholder: this.examples[this.forIndex] });
            return (this.forIndex == (this.examples.length - 1))? this.forIndex = 0: this.forIndex += 1;
        }
        this.setState({ placeholder: this.writeHere });
    }
    onChangeSearch(Query: string) {
        if (this.state.searchQuery.length > Query.length) return this.setState({ searchQuery: Query }, this.props.onEmpty);
        this.setState({ searchQuery: Query });
    }
    render(): React.ReactNode {
        const { isDark, theme } = this.context;
        return(<Searchbar
            ref={this.ref}
            autoFocus={(this.props.disableAutoFocus)? false: true}
            value={this.state.searchQuery}
            style={[styles.searchbar, (isDark)? { backgroundColor: theme.colors.background }: undefined]}
            placeholder={this.state.placeholder}
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
        marginBottom: 8
    },
    viewLoading: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center'
    },
    viewSearchbar: {
        //backgroundColor: Theme.colors.primary,
        marginTop: -8,
        //borderBottomColor: Theme.colors.primary,
        borderBottomWidth: 1
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