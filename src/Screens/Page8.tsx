import React, { createRef, PureComponent } from "react";
import { DeviceEventEmitter, EmitterSubscription, FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Divider, IconButton, List, Provider as PaperProvider, Text } from "react-native-paper";
import { ThemeContext } from "../Components/ThemeProvider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomCard5 from "../Components/Elements/CustomCard5";
import { DataGroup, OldData as OldDataType } from "../Scripts/ApiTecnica/types";
import { OldData } from "../Scripts/ApiTecnica";
import { decode } from "base-64";
import LoadingComponent from "../Components/LoadingComponent";
import CustomSnackbar from "../Components/Elements/CustomSnackbar";
import CustomItemOldRegist from "../Components/Elements/CustomItemOldRegist";

type IProps = {
    navigation: any;
};
type IState = {
    isLoading: boolean;
    isRefresh: boolean;
    isError: boolean;
    messageError: string;

    datas: OldDataType[];
};

export default class Page8 extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isLoading: false,
            isRefresh: false,
            isError: false,
            messageError: '',
            datas: []
        };
        this.loadData = this.loadData.bind(this);
        this._renderItem = this._renderItem.bind(this);
        this._goLoading = this._goLoading.bind(this);
        this._showSnackbar = this._showSnackbar.bind(this);
    }
    static contextType = ThemeContext;
    private event: EmitterSubscription | null = null;
    // Ref's
    private refLoadingComponent = createRef<LoadingComponent>();
    private refCustomSnackbar = createRef<CustomSnackbar>();

    componentDidMount(): void {
        this.loadData();
        this.event = DeviceEventEmitter.addListener('p8-reload', (isReload?: boolean)=>(isReload)? this.setState({ isRefresh: true }, this.loadData): this.loadData);
    }
    componentWillUnmount(): void {
        this.event?.remove();
    }
    loadData() {
        if (!this.state.isRefresh) this.setState({ isLoading: true, datas: [] });
        this.setState({ isError: false }, ()=>
            OldData.getAll()
                .then((datas)=>this.setState({ isLoading: false, isRefresh: false, datas }))
                .catch((error)=>this.setState({ isLoading: false, isError: true, messageError: error.cause }))
        );
    }

    // Flatlist
    _renderItem({ item }: ListRenderItemInfo<OldDataType>) {
        return(<CustomItemOldRegist
            key={`item-oldregist-${item.age}`}
            title={`Año ${item.age}`}
            onPress={()=>console.log(item.age)}
        />);
    }
    _getItemLayout(_data: OldDataType[] | null | undefined, index: number) {
        return {
            length: 72,
            offset: 72 * index,
            index
        };
    }
    _keyExtractor(item: OldDataType, _index: number) {
        return `item-oldregist-${item.age}`;
    }
    _ItemSeparatorComponent() {
        return(<Divider />);
    }

    // Functions
    _goLoading(visible: boolean, message?: string) {
        if (!visible) return this.refLoadingComponent.current?.close();
        if (this.refLoadingComponent.current?.state.visible) this.refLoadingComponent.current?.update(message!);
        this.refLoadingComponent.current?.open(message!);
    }
    _showSnackbar(visible: boolean, message?: string) {
        if (!visible) this.refCustomSnackbar.current?.close();
        this.refCustomSnackbar.current?.open(message!);
    }

    render(): React.ReactNode {
        const { theme } = this.context;
        return(<View style={{ flex: 1 }}>
            <PaperProvider theme={theme}>
                <Appbar.Header>
                    <Appbar.Action icon={'menu'} onPress={this.props.navigation.openDrawer} />
                    <Appbar.Content title={'Registros antiguos'} />
                </Appbar.Header>
                <View style={styles.content}>
                    {(!this.state.isLoading)? (!this.state.isError)?
                    <FlatList
                        data={this.state.datas}
                        keyExtractor={this._keyExtractor}
                        refreshControl={<RefreshControl colors={[theme.colors.primary]} progressBackgroundColor={theme.colors.surface} refreshing={this.state.isRefresh} onRefresh={()=>this.setState({ isRefresh: true }, this.loadData)} />}
                        contentContainerStyle={{ flex: (this.state.datas.length == 0)? 2: undefined }}
                        ListEmptyComponent={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Icon name={'playlist-remove'} color={theme.colors.text} size={80} /><Text style={{ marginTop: 8 }}>No se encontró ningún registro</Text></View>}
                        getItemLayout={this._getItemLayout}
                        ItemSeparatorComponent={this._ItemSeparatorComponent}
                        renderItem={this._renderItem}
                    />:
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                            <Icon name={'account-alert-outline'} size={48} color={theme.colors.text} style={{ fontSize: 48 }} />
                            <Text style={{ marginTop: 14 }}>{this.state.messageError}</Text>
                            <IconButton icon={'reload'} color={theme.colors.primary} size={28} onPress={()=>this.loadData()} style={{ marginTop: 12 }} />
                        </View>
                    </View>
                    :<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size={'large'} animating /></View>}
                </View>
                <CustomSnackbar ref={this.refCustomSnackbar} />

                <LoadingComponent ref={this.refLoadingComponent} />
            </PaperProvider>
        </View>);
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        overflow: 'hidden'
    }
});