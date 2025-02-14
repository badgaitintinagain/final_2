const { MongoClient } = require('mongodb');
const url = process.env.mongodb_url;
const dbName = process.env.mongodb_db_name;

const client = new MongoClient(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

async function connect() {
    try {
        await client.connect();
        return client.db(dbName);
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
    }
}

module.exports = { connect };