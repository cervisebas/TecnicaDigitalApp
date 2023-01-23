import React, { useContext } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, ToastAndroid, View } from "react-native";
import { OldDataFile } from "../../Scripts/ApiTecnica/types";
import { Divider, List } from "react-native-paper";
import { ThemeContext } from "../../Components/ThemeProvider";
import FileViewer from "react-native-file-viewer";
import RNFS from "react-native-fs";

type IProps = {
    curse: string;
    files: OldDataFile[];
    controllerLoading: (visible: boolean, message?: string)=>void;
};

export default React.memo(function ListActualData(props: IProps) {
    const { theme } = useContext(ThemeContext);

    async function checkExist(file: string): Promise<false | string> {
        try {
            const uriCache = `${RNFS.CachesDirectoryPath}/${file}`;
            const uriDownload = `${RNFS.DownloadDirectoryPath}/${file}`;
            const findCache = await RNFS.exists(uriCache);
            const findDownload = await RNFS.exists(uriDownload);
            if (findCache) return uriCache;
            if (findDownload) return uriDownload;
            return false;
        } catch {
            return false;
        }
    }

    async function downloadFile(url: string) {
        const fileName = url.split('/').pop();
        const check = await checkExist(fileName!);
        if (check) {
            ToastAndroid.show('Se encontró el archivo ya descargado.', ToastAndroid.SHORT);
            return FileViewer.open(check, { showOpenWithDialog: true, showAppsSuggestions: true }).catch(()=>ToastAndroid.show('Ocurrió un problema al abrir el archivo.', ToastAndroid.SHORT));
        }

    }


    function _leftItem(lProps: { color: string; style: { marginLeft: number; marginRight: number; marginVertical?: number | undefined; }; }) {
        return(<List.Icon {...lProps} icon={'calendar-multiple'} />);
    }
    function _rightItem(rProps: { color: string; style?: { marginRight: number; marginVertical?: number | undefined; } | undefined; }) {
        return(<List.Icon {...rProps} color={theme.colors.primary} icon={'download-outline'} />);
    }
    function _renderItem({ item }: ListRenderItemInfo<OldDataFile>) {
        return(<List.Item
            title={item.month}
            left={_leftItem}
            right={_rightItem}
            style={styles.item}
            onPress={()=>undefined}
        />);
    }
    function _ItemSeparatorComponent() { return(<Divider />); }
    function _getItemLayout(_data: OldDataFile[] | null | undefined, index: number) {
        return { length: 56, offset: 56 * index, index };
    }

    return(<View style={styles.content}>
        <FlatList
            data={props.files}
            ItemSeparatorComponent={_ItemSeparatorComponent}
            getItemLayout={_getItemLayout}
            renderItem={_renderItem}
        />
    </View>);
});

const styles = StyleSheet.create({
    content: {
        flex: 1
    },
    item: {
        height: 56
    }
});