import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for the app data
const STORAGE_KEY = 'sunday-groceries-data';

// Define the interface for the store's state and actions
export interface ListState {
    list: { name: string; items: { name: string; complete: boolean; }[] }[],
    pantry: string[],
    addItem: (category: string, item: string) => void;
    completeItem: (category: string, item: string) => void;
    removeItem: (category: string, item: string) => void;
    refreshList: () => void;
    isLoaded: boolean;
}

// Default initial data
const defaultData = {
    list: [
        {
            name: 'Produce',
            items: [
                { name: 'apples', complete: false },
                { name: 'grapes', complete: true },
                { name: 'onion', complete: false },
                { name: 'pear', complete: false },
            ],
        },
        {
            name: 'Dairy',
            items: [{ name: 'milk', complete: true }],
        },
        {
            name: 'Protein', items: [{
                name: 'Chicken', complete: false
            }]
        },
        { name: 'Pantry', items: [] },
        { name: 'Frozen', items: [] },
    ],
    pantry: [],
};

// Helper functions for AsyncStorage
const saveData = async (data: { list: ListState['list']; pantry: ListState['pantry'] }) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

const loadData = async (): Promise<{ list: ListState['list']; pantry: ListState['pantry'] } | null> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
};

export const useListStore = create<ListState>()(
    (set, get) => ({
        ...defaultData,
        isLoaded: false,
        addItem: (category: string, item: string) => {
            set((state) => {
                const categoryIndex = state.list.findIndex(c => c.name === category);
                
                const newList = [...state.list];
                newList[categoryIndex] = {
                    ...newList[categoryIndex],
                    items: [...newList[categoryIndex].items, { name: item, complete: false }]
                };

                const newState = { list: newList };
                saveData({ list: newList, pantry: state.pantry });
                return newState;
            });
        },
        completeItem: (category: string, item: string) => {
            set((state) => {
                const categoryIndex = state.list.findIndex(c => c.name === category);
                const itemIndex = state.list[categoryIndex].items.findIndex(i => i.name === item);
                
                const newList = [...state.list];
                newList[categoryIndex] = {
                    ...newList[categoryIndex],
                    items: [...newList[categoryIndex].items]
                };
                newList[categoryIndex].items[itemIndex] = {
                    ...newList[categoryIndex].items[itemIndex],
                    complete: !newList[categoryIndex].items[itemIndex].complete
                };

                const newState = { list: newList };
                saveData({ list: newList, pantry: state.pantry });
                return newState;
            });
        },
        removeItem: (category: string, item: string) => {
            set((state) => {
                const categoryIndex = state.list.findIndex(c => c.name === category);
                
                const newList = [...state.list];
                newList[categoryIndex] = {
                    ...newList[categoryIndex],
                    items: newList[categoryIndex].items.filter(i => i.name !== item)
                };

                const newState = { list: newList };
                saveData({ list: newList, pantry: state.pantry });
                return newState;
            });
        },
        refreshList: () => {
            set((state) => {
                const completedItems: string[] = [];
                const newList = state.list.map(category => ({
                    ...category,
                    items: category.items.filter(item => {
                        if (item.complete) {
                            completedItems.push(item.name);
                            return false;
                        }
                        return true;
                    })
                }));
                const newPantry = [...state.pantry, ...completedItems];
                const newState = {
                    list: newList,
                    pantry: newPantry
                };
                saveData(newState);
                return newState;
            });
        }
    }));

// Initialize store with persisted data
const initializeStore = async () => {
    const persistedData = await loadData();
    if (persistedData) {
        useListStore.setState({
            ...persistedData,
            isLoaded: true
        });
    } else {
        useListStore.setState({ isLoaded: true });
    }
};

// Call initialization
initializeStore();