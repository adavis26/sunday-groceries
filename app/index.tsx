import { ScrollView, View, Text, SafeAreaView, TextInput, TouchableOpacity } from "react-native";
import { useListStore } from "@/store/useStore";
import { useState } from "react";
import { GestureHandlerRootView, } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Link, useRouter } from 'expo-router';
import Button from '@/components/Button';

export default function List() {
    const list = useListStore(state => state.list);
    const router = useRouter();

    const refreshList = useListStore((state) => state.refreshList);

    return (
        <SafeAreaView style={{ flex: 1 }} className="bg-white">
            <View className="pl-4 pt-2">
                <Text className="text-2xl font-bold">sunday groceries</Text>
            </View>
            <View className="p-6">
                <View className="flex-row gap-2">
                    <Button title="Shopping Mode" onPress={() => router.push('/shopping')} color="blue" className="flex-1" />
                    <Link href="/pantry" asChild>
                        <Button title="View Pantry" onPress={() => {}} color="purple" className="flex-1" />
                    </Link>
                </View>
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
                        <Category key={i} category={category} />
                    ))}
                    <View className="mt-6 mb-4">
                        <Button title="Complete List" onPress={refreshList} color="green" />
                    </View>
                </GestureHandlerRootView>

            </ScrollView>
        </SafeAreaView>
    );
}

const ShoppingListItem = ({ categoryName, item, toggleComplete }: { categoryName: string; item: { name: string, complete: boolean }; toggleComplete: (name: string) => void }) => {
    const completeItem = useListStore(state => state.completeItem);
    const itemComplete = useListStore(state => state.list.find(category => category.name === categoryName)?.items.find(i => i.name === item.name)?.complete);

    const handleToggleComplete = (name: string) => {
        completeItem(categoryName, name);
    }

    return (
        <View>
            <View className="p-3">
                <TouchableOpacity onPress={() => handleToggleComplete(item.name)} className="flex-row gap-3">
                    <View className={clsx("h-5 w-5 rounded-full", itemComplete ? 'bg-green-400' : 'border')}></View>
                    <Text className={clsx(itemComplete ? 'line-through' : '')}>{item.name}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const Category = ({ category }: { category: { name: string; items: { name: string; complete: boolean; }[] } }) => {
    const [newItem, setNewItem] = useState('');
    const addItem = useListStore((state) => state.addItem);

    const handleAddItem = () => {
        if (newItem.trim()) {
            addItem(category.name, newItem.trim());
            setNewItem('');
        }
    };

    return (
        <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 20 }}>{category.name}</Text>
            <View>
                {category.items.map((item, j) => (
                    <ShoppingListItem key={j} categoryName={category.name} item={item} toggleComplete={() => {}} />
                ))}
                <View className="p-3">
                    <View className="flex-row gap-3 items-center">
                        <View className="h-5 w-5 rounded-full border-2 border-gray-300 items-center justify-center">

                        </View>
                        <TextInput
                            placeholder="Add item..."
                            className="flex-1 text-base"
                            value={newItem}
                            onChangeText={setNewItem}
                            onSubmitEditing={handleAddItem}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};