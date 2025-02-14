const { MongoClient } = require('mongodb');
const url = process.env.mongodb_url;
const dbName = process.env.mongodb_db_name;

// Create MongoDB client
const client = new MongoClient(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

// Connect to database
async function connect() {
    try {
        await client.connect();
        const db = client.db(dbName);
        return db;
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
    }
}

// Export the connect function
module.exports = { connect };