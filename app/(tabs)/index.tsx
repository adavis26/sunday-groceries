import { ScrollView, View, Text, SafeAreaView, TextInput, Touchable, Button } from "react-native";
import { ListState, useListStore } from "@/store/useStore";
import { useState } from "react";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

export default function List() {

    const list = useListStore(state => state.list);

    const [newItem, setNewItem] = useState('');

    const addItem = useListStore((state) => state.addItem);

    const handleAddItem = () => {
        addItem('Produce', newItem);
        setNewItem('');
    }



    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View>
                <TextInput
                    placeholder="add a new item"
                    style={{
                        padding: 10,
                        margin: 20,
                        borderStyle: 'solid',
                        borderColor: 'black',
                        borderWidth: 1,
                        borderRadius: 5
                    }}
                    value={newItem}
                    onChangeText={setNewItem}
                ></TextInput>

                <Button disabled={newItem === ''} onPress={handleAddItem} title="Add Item"></Button>
            </View>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                style={{
                    flex: 1,
                    flexDirection: "column",
                    padding: 20
                }}
            >
                <GestureHandlerRootView style={{ flex: 1 }}>
                    {list.map((category, i) => (
                        <View key={i} style={{ marginTop: 20 }}>
                            <Text style={{ fontSize: 20, display: 'flex', flexDirection: 'column' }}>{category.name}</Text>
                            <View>
                                {category.items.map((item, j) => (
                                    <ShoppingListItem key={j} categoryName={category.name} item={item} />
                                ))}
                                {category.items.length === 0 && <Text style={{ color: 'gray', margin: 10 }}>No items</Text>}
                            </View>
                        </View>

                    ))}
                </GestureHandlerRootView>

            </ScrollView>
        </SafeAreaView>
    );
}

const ShoppingListItem = ({ categoryName, item }: { categoryName: string; item: { name: string, complete: boolean } }) => {
    const completeItem = useListStore(state => state.completeItem);

    const handleCompleteItem = () => {
        console.log('completing item', item.name);
        completeItem(categoryName, item.name);
    }

    const cellStyle = { padding: 10, height: 40, borderRadius: 5 }
    // Left action (mark as complete)
    const completeAction = () => (
        <View style={{ ...cellStyle, width: 100, backgroundColor: '#98e092' }}>
            <Text style={{ textAlign: 'center' }} onPress={handleCompleteItem}>Complete</Text>
        </View>
    );

    // Right action (delete item)
    const deleteAction = () => (
        <View style={{ ...cellStyle, width: 100, backgroundColor: '#e09392' }}>
            <Text style={{ textAlign: 'center' }}>Delete</Text>
        </View>
    );

    return (
        <View style={{ marginVertical: 5 }}>
            <Swipeable
                renderLeftActions={deleteAction}
                renderRightActions={completeAction}
                friction={1}
                overshootFriction={8}
                overshootLeft={false}
                overshootRight={false}
            >
                <View style={{ ...cellStyle, backgroundColor: 'white' }}>
                    <Text>
                        {item.name}
                    </Text>
                </View>
            </Swipeable>
        </View>
    );
};