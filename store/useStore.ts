import { create } from 'zustand';

// Define the interface for the store's state and actions
export interface ListState {
    list: { name: string; items: { name: string; complete: boolean; }[] }[],
    addItem: (category: string, item: string) => void;
    completeItem: (category: string, item: string) => void;
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
        addItem: (category: string, item: string) => {
            set((state) => {
                const categoryIndex = state.list.findIndex(c => c.name === category);

                state.list[categoryIndex].items.push({ name: item, complete: false });

                return { list: state.list };
            });
        },
        completeItem: (category: string, item: string) => {

            set((state) => {
                const categoryIndex = state.list.findIndex(c => c.name === category);


                const itemIndex = state.list[categoryIndex].items.findIndex(i => i.name === item)

                state.list[categoryIndex].items[itemIndex].complete = true;

                console.log(state.list[categoryIndex]);

                return { list: state.list };
            });
        }
    }));