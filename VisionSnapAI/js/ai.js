export const CATEGORIES = {
    GENERAL: 'general',
    FOOD: 'food',
    PLANT: 'plant'
};

const MOCK_RESULTS = {
    [CATEGORIES.GENERAL]: [
        { name: 'Wireless Headphones', status: 'safe', label: 'Electronic', desc: 'A pair of over-ear wireless headphones with noise cancellation.', details: { 'Brand': 'Generic', 'Battery': '24h' } },
        { name: 'Ceramic Mug', status: 'safe', label: 'Kitchenware', desc: 'White ceramic mug, standard 12oz size.', details: { 'Material': 'Ceramic', 'Microwave': 'Safe' } },
        { name: 'Laptop', status: 'safe', label: 'Electronic', desc: 'High-performance laptop suitable for development.', details: { 'OS': 'Windows', 'RAM': '16GB' } }
    ],
    [CATEGORIES.FOOD]: [
        { name: 'Red Apple', status: 'safe', label: 'Fruit', desc: 'Fresh red apple, rich in fiber and vitamin C.', details: { 'Calories': '95', 'Sugar': '19g' } },
        { name: 'Pepperoni Pizza', status: 'warning', label: 'Fast Food', desc: 'Slice of pepperoni pizza. High in sodium and saturated fats.', details: { 'Calories': '250', 'Fat': '12g' } },
        { name: 'Avocado Toast', status: 'safe', label: 'Breakfast', desc: 'Toasted bread topped with mashed avocado.', details: { 'Calories': '350', 'Protein': '8g' } }
    ],
    [CATEGORIES.PLANT]: [
        { name: 'Snake Plant', status: 'safe', label: 'Indoor Plant', desc: 'Sansevieria trifasciata. Excellent air purifier, low maintenance.', details: { 'Light': 'Low-Bright', 'Water': 'Low' } },
        { name: 'Monstera', status: 'warning', label: 'Tropical', desc: 'Monstera deliciosa. Toxic to pets if ingested.', details: { 'Toxicity': 'High (Pets)', 'Growth': 'Fast' } },
        { name: 'Aloe Vera', status: 'safe', label: 'Succulent', desc: 'Medicinal plant known for soothing skin.', details: { 'Care': 'Easy', 'Water': 'Moderate' } }
    ]
};

export async function analyzeImage(imageBlob, category) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Pick a random result from the selected category
            const options = MOCK_RESULTS[category] || MOCK_RESULTS[CATEGORIES.GENERAL];
            const result = options[Math.floor(Math.random() * options.length)];
            
            // Add timestamp
            resolve({
                ...result,
                timestamp: new Date().toISOString(),
                imageUrl: URL.createObjectURL(imageBlob) // In real app, this comes from server
            });
        }, 2000); // 2 second delay to simulate AI processing
    });
}
