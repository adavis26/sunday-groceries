import { create } from 'zustand';

// Define the interface for the store's state and actions
export interface ListState {
    list: { name: string; items: { name: string; complete: boolean; }[] }[],
    pantry: string[],
    addItem: (category: string, item: string) => void;
    completeItem: (category: string, item: string) => void;
    refreshList: () => void;
}

export const useListStore = create<ListState>()(
    set => ({
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
        addItem: (category: string, item: string) => {
            set((state) => {
                const categoryIndex = state.list.findIndex(c => c.name === category);
                
                const newList = [...state.list];
                newList[categoryIndex] = {
                    ...newList[categoryIndex],
                    items: [...newList[categoryIndex].items, { name: item, complete: false }]
                };

                return { list: newList };
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

                return { list: newList };
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
                return {
                    list: newList,
                    pantry: [...state.pantry, ...completedItems]
                };
            });
        }
    }));