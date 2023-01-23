import React, { useContext } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import { OldDataFile } from "../../Scripts/ApiTecnica/types";
import { Divider, List } from "react-native-paper";
import { ThemeContext } from "../../Components/ThemeProvider";

type IProps = {
    curse: string;
    files: OldDataFile[];
};

export default React.memo(function ListActualData(props: IProps) {
    const { theme } = useContext(ThemeContext);

    function _leftItem(lProps: { color: string; style: { marginLeft: number; marginRight: number; marginVertical?: number | undefined; }; }) {
        return(<List.Icon {...lProps} icon={'calendar-multiple'} />);
    }
    function _rightItem(rProps: { color: string; style?: { marginRight: number; marginVertical?: number | undefined; } | undefined; }) {
        return(<List.Icon {...rProps} color={theme.colors.primary} icon={'eye-outline'} />);
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