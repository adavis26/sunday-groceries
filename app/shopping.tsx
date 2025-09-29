import { useListStore } from "@/store/useStore";
import { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from 'expo-router';
import Button from '@/components/Button';

export default function Shopping() {
    const list = useListStore(state => state.list);
    const router = useRouter();

    const total = list.reduce((acc, curr) => acc += curr.items.length, 0);
    const complete = list.reduce((acc, curr) => acc += curr.items.filter(item => item.complete).length, 0);
    const incomplete = total - complete;

    // Track expanded state for each category
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    
    // Modal state
    const [showCongratsModal, setShowCongratsModal] = useState(false);

    // Show congrats modal when list becomes complete
    useEffect(() => {
        if (incomplete === 0 && total > 0) {
            setShowCongratsModal(true);
        }
    }, [incomplete, total]);

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryName)) {
                newSet.delete(categoryName);
            } else {
                newSet.add(categoryName);
            }
            return newSet;
        });
    };

    // Track double taps for categories
    const categoryTapRefs = useRef<{ [key: string]: number }>({});

    const handleCategoryPress = (categoryName: string, isComplete: boolean) => {
        if (!isComplete) return; // Only allow toggling for completed categories
        
        const now = Date.now();
        const lastTap = categoryTapRefs.current[categoryName] || 0;
        
        if (now - lastTap < 300) { // Double tap within 300ms
            toggleCategory(categoryName);
        }
        
        categoryTapRefs.current[categoryName] = now;
    };

        const colorThemes: { [key: string]: { border: string; text: string } } = {
        'Produce': { border: '#000000', text: '#6f42c1' },
        'Dairy': { border: '#000000', text: '#007bff' },
        'Protein': { border: '#000000', text: '#ffc107' },
        'Pantry': { border: '#000000', text: '#fd7e14' },
        'Frozen': { border: '#000000', text: '#6c757d' }
    }

    return <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        <View style={{ padding: 20, backgroundColor: '#ffffff', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#dee2e6' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000000' }}>Shopping</Text>
                        <Text style={{ fontSize: 20, marginTop: 5, color: '#000000' }}>{incomplete} items left</Text>
        </View>
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <ScrollView style={{ flex: 1 }}>
                {list.map((category, i) => {
                    const isEmpty = category.items.length === 0;
                    const isComplete = category.items.length > 0 && category.items.every(item => item.complete);
                    const isExpanded = expandedCategories.has(category.name) || (!isComplete && !isEmpty);
                    
                    return (
                        <TouchableOpacity 
                            key={category.name} 
                            onPress={() => handleCategoryPress(category.name, isComplete)}
                            activeOpacity={isComplete ? 0.7 : 1}
                            style={{ 
                                backgroundColor: '#ffffff', 
                                margin: 10, 
                                borderRadius: 10, 
                                padding: isEmpty ? 15 : 20, 
                                borderWidth: 1, 
                                borderColor: isEmpty ? '#e9ecef' : '#000000',
                                opacity: isEmpty ? 0.6 : 1
                            }}
                        >
                            <Text style={{ 
                                fontSize: isEmpty ? 18 : 24, 
                                fontWeight: 'bold', 
                                marginBottom: 10,
                                color: isEmpty ? '#6c757d' : colorThemes[category.name].text 
                            }}>
                                {category.name} {isEmpty ? '(0)' : isComplete ? '✅' : `(${category.items.filter(item => !item.complete).length})`}
                            </Text>
                            {isExpanded && (
                                <>
                                    {category.items.map((item, j) => (
                                        <ShoppingItem key={j} categoryName={category.name} item={item} />
                                    ))}
                                    {isEmpty && <Text style={{ fontSize: 16, color: '#adb5bd', fontStyle: 'italic', textAlign: 'center', margin: 10 }}>No items in this category</Text>}
                                </>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </KeyboardAvoidingView>
        <View style={{ padding: 20 }}>
            <Button title="Back to List" onPress={() => router.back()} color="blue" />
        </View>

        <Modal
            visible={showCongratsModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowCongratsModal(false)}
        >
            <View style={{ 
                flex: 1, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: 20
            }}>
                <View style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: 20, 
                    padding: 30, 
                    alignItems: 'center',
                    width: '90%',
                    maxWidth: 400
                }}>
                    <Text style={{ fontSize: 60, marginBottom: 20 }}>🎉</Text>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#28a745' }}>
                        Congratulations!
                    </Text>
                    <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 30, color: '#6c757d' }}>
                        You've completed your shopping list! All items have been checked off.
                    </Text>
                    <Button 
                        title="Complete List" 
                        onPress={() => {
                            setShowCongratsModal(false);
                            // Trigger the refresh list action to move completed items to pantry
                            const refreshList = useListStore.getState().refreshList;
                            refreshList();
                            router.back();
                        }} 
                        color="green" 
                    />
                </View>
            </View>
        </Modal>
    </SafeAreaView>
}

const ShoppingItem = ({ categoryName, item }: { categoryName: string; item: { name: string; complete: boolean } }) => {
    const completeItem = useListStore(state => state.completeItem);
    const lastTap = useRef<number>(0);

    const handleDoubleTap = () => {
        const now = Date.now();
        if (now - lastTap.current < 300) { // 300ms window for double tap
            completeItem(categoryName, item.name);
        }
        lastTap.current = now;
    };

    return (
        <TouchableOpacity
            onPress={handleDoubleTap}
            style={{
                paddingVertical: 12,
                paddingHorizontal: 8,
                marginVertical: 4,
                backgroundColor: '#ffffff',
                borderRadius: 8,
                borderWidth: item.complete ? 1 : 2,
                borderColor: item.complete ? '#dee2e6' : '#000000'
            }}
        >
            <Text style={{
                fontSize: 20,
                textDecorationLine: item.complete ? 'line-through' : 'none',
                color: item.complete ? '#6c757d' : '#212529'
            }}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );
};