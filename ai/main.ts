import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-node';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as fs from 'fs';
import path from 'path';

function checkModelExists() {
    return fs.existsSync(path.join(__dirname, 'model', 'model.json'));
}

// Load the Universal Sentence Encoder (pretrained model for text embeddings)
async function loadUSEModel() {
    return await use.load();
}

enum FoodCategory {
    produce = 'produce',
    dairy = 'dairy',
    protein = 'protein',
    pantry = 'pantry',
    frozen = 'frozen',
    bakery = 'bakery',
}

// training set
const foodItemsWithCategories: { [key: string]: FoodCategory } = {
    apples: FoodCategory.produce,
    milk: FoodCategory.dairy,
    'chicken breast': FoodCategory.protein,
    bread: FoodCategory.pantry,
    'ice cream': FoodCategory.frozen,
    bananas: FoodCategory.produce,
    cheese: FoodCategory.dairy,
    steak: FoodCategory.protein,
    rice: FoodCategory.pantry,
    'frozen pizza': FoodCategory.frozen,
    'cumin': FoodCategory.pantry,
    'pie': FoodCategory.bakery,
    'french bread': FoodCategory.bakery,
    'white bread': FoodCategory.pantry,
};

// Dynamically generate the one-hot encoding based on FoodCategory values
const categories = Object.values(FoodCategory);
const categoryEncoding: { [key: string]: number[] } = categories.reduce((encoding, category, index) => {
    const oneHot = new Array(categories.length).fill(0);
    oneHot[index] = 1;
    encoding[category] = oneHot;
    return encoding;
}, {} as { [key: string]: number[] });

console.log(categoryEncoding)

async function createTensors() {
    // Load the Universal Sentence Encoder (pretrained model for text embeddings)
    const encoder = await loadUSEModel()

    // Extract food items and categories
    const foodItems = Object.keys(foodItemsWithCategories);
    const foodCategories = foodItems.map(item => foodItemsWithCategories[item]);

    // Convert each food item to an embedding
    const embeddings = await Promise.all(
        foodItems.map(async item => {
            const embedding = await encoder.embed(item);
            return embedding.arraySync()[0]; // Convert the embedding to a flat array
        })
    );

    // Create the input tensor (embeddings for the food items)
    const inputTensor = tf.tensor2d(embeddings);

    // Create the output tensor (one-hot encoded categories)
    const outputTensor = tf.tensor2d(
        foodCategories.map(category => categoryEncoding[category])
    );

    return { inputTensor, outputTensor };
}


async function trainModel() {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 32, inputShape: [512], activation: 'relu' }));
    model.add(tf.layers.dense({ units: categories.length, activation: 'softmax' }));

    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    const { inputTensor, outputTensor } = await createTensors();

    await model.fit(inputTensor, outputTensor, {
        epochs: 100,
        callbacks: tf.callbacks.earlyStopping({ monitor: 'val_loss', patience: 10 }),
    });

    return model;
}


async function predictCategory(foodItem: string, model: tf.LayersModel) {
    try {
        const encoder = await loadUSEModel();
        console.log(`embedding, ${foodItem}`)
        const embedding = await encoder.embed(foodItem);
        const reshapedEmbedding = embedding.reshape([1, 512]);  // Ensure 2D tensor
        const prediction = model.predict(reshapedEmbedding) as tf.Tensor;

        const predictedIndex = prediction.argMax(-1).dataSync()[0];

        console.log(`The category for "${foodItem}" is: ${categories[predictedIndex]}\n`);

        embedding.dispose();
        reshapedEmbedding.dispose();
        prediction.dispose();
    } catch (e) {
        console.log("🔴 could not predict:")
        console.log(e)
    }

    await sleep(1000);
}

function readCSVFile(filePath: string): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                const rows = data.split('\n');
                const csvData: string[][] = [];


                rows.forEach(row => csvData.push(row.split(',')));
                resolve(csvData);
            }
        });
    });
}

// Function to save data as a JSON file
function saveAsJson(data: any, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data);
        fs.writeFile(filePath, jsonData, 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function cleanData(data: string[][]): string[] {
    const foodNames = data.map(row => row[0].trim().replace(/"/g, '').toLocaleLowerCase());

    const foodSet = new Set(foodNames);

    return Array.from(foodSet);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



// Usage
(async () => {

    // const data = await readCSVFile('food.csv');

    // const cleanedData = cleanData(data);

    // await saveAsJson(cleanedData, 'cleanedData.json');

    const filepath = path.join(__dirname, 'model')

    if (!checkModelExists()) {
        console.log("Training model...");
        const newModel = await trainModel();
        console.log("Model trained successfully!");
        await newModel.save(`file://${filepath}`);
        console.log("Model saved")
    }

    const model = await tf.loadLayersModel(`file://${filepath}/model.json`);

    // await predictCategory('cumin', model);
    // await predictCategory('chicken breasts', model);
    // await predictCategory('ice cream', model);
    // await predictCategory('pie', model)
    // await predictCategory('french bread', model);
    // await predictCategory('rotisserie chicken', model);

    // await predictCategory('grapes', model);

    // await predictCategory('egg noodles', model);

    await predictCategory('Sweet baby rays terriyaki sauce', model);


})();