import { ScrollView, View, Text, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useListStore } from "@/store/useStore";
import { useState, useRef } from "react";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import clsx from 'clsx';
import { Link, useRouter } from 'expo-router';
import Button from '@/components/Button';

export default function List() {
    const list = useListStore(state => state.list);
    const isLoaded = useListStore(state => state.isLoaded);
    const router = useRouter();

    const refreshList = useListStore((state) => state.refreshList);
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToInput = (y: number) => {
        scrollViewRef.current?.scrollTo({ y: y - 100, animated: true });
    };

    if (!isLoaded) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

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
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={{ flexGrow: 1 }}
                        style={{
                            flex: 1,
                            flexDirection: "column",
                            padding: 20
                        }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <GestureHandlerRootView style={{ flex: 1 }}>
                            {list.map((category, i) => (
                                <Category key={i} category={category} onInputFocus={scrollToInput} />
                            ))}
                            <View className="mt-6 mb-4">
                                <Button title="Complete List" onPress={refreshList} color="green" />
                            </View>
                        </GestureHandlerRootView>

                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const ShoppingListItem = ({ categoryName, item, toggleComplete }: { categoryName: string; item: { name: string, complete: boolean }; toggleComplete: (name: string) => void }) => {
    const completeItem = useListStore(state => state.completeItem);
    const removeItem = useListStore(state => state.removeItem);

    const handleToggleComplete = (name: string) => {
        completeItem(categoryName, name);
    };

    const handleDelete = () => {
        removeItem(categoryName, item.name);
    };

    const renderRightActions = () => (
        <TouchableOpacity 
            onPress={handleDelete}
            style={{
                backgroundColor: '#dc3545',
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                borderRadius: 8,
                marginVertical: 4
            }}
        >
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Delete</Text>
        </TouchableOpacity>
    );

    return (
        <Swipeable renderRightActions={renderRightActions}>
            <View className="p-3">
                <TouchableOpacity onPress={() => handleToggleComplete(item.name)} className="flex-row gap-3">
                    <View className={clsx("h-5 w-5 rounded-full", item.complete ? 'bg-green-400' : 'border')}></View>
                    <Text className={clsx(item.complete ? 'line-through' : '')}>{item.name}</Text>
                </TouchableOpacity>
            </View>
        </Swipeable>
    );
};

const Category = ({ category, onInputFocus }: { category: { name: string; items: { name: string; complete: boolean; }[] }; onInputFocus: (y: number) => void }) => {
    const [newItem, setNewItem] = useState('');
    const addItem = useListStore((state) => state.addItem);
    const inputRef = useRef<TextInput>(null);

    const handleAddItem = () => {
        if (newItem.trim()) {
            // Split on newlines and add each line as a separate item
            const items = newItem.split('\n').map(item => item.trim().replace(/^\W+/, '')).filter(item => item.length > 0);
            items.forEach(item => {
                addItem(category.name, item);
            });
            setNewItem('');
        }
    };

    const handleInputFocus = () => {
        inputRef.current?.measure((x, y, width, height, pageX, pageY) => {
            onInputFocus(pageY);
        });
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
                            ref={inputRef}
                            placeholder="Add item..."
                            className="flex-1 text-base"
                            style={{
                                minHeight: 40,
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderColor: '#e9ecef',
                                borderRadius: 8,
                                backgroundColor: '#f8f9fa'
                            }}
                            value={newItem}
                            onChangeText={setNewItem}
                            onSubmitEditing={handleAddItem}
                            onFocus={handleInputFocus}
                            multiline={true}
                            blurOnSubmit={false}
                        />
                        <TouchableOpacity 
                            onPress={handleAddItem}
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                backgroundColor: '#007bff',
                                borderRadius: 8,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};