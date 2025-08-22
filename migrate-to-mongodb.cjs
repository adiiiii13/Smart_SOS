const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/sos_app';
const DB_NAME = 'sos_app';

// Sample data structure for MongoDB (you'll need to adapt this based on your actual Firebase data)
const sampleData = {
  users: [
    {
      email: 'user@example.com',
      displayName: 'Sample User',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  profiles: [
    {
      userId: 'user_id_here',
      full_name: 'Sample User',
      email: 'user@example.com',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  notifications: [
    {
      userId: 'user_id_here',
      type: 'info',
      title: 'Welcome',
      message: 'Welcome to SOS App',
      priority: 'low',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  emergencies: [
    {
      userId: 'user_id_here',
      userName: 'Sample User',
      emergencyType: 'accident',
      location: 'Sample Location',
      description: 'Sample emergency description',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  friend_requests: [
    {
      fromUserId: 'user1_id',
      fromUserName: 'User 1',
      toUserId: 'user2_id',
      toUserName: 'User 2',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  friends: [
    {
      userId: 'user1_id',
      friendId: 'user2_id',
      friendName: 'User 2',
      friendEmail: 'user2@example.com',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

async function migrateToMongoDB() {
  let client;
  
  try {
    console.log('🚀 Starting migration to MongoDB...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Create collections and insert sample data
    for (const [collectionName, documents] of Object.entries(sampleData)) {
      if (documents.length > 0) {
        const collection = db.collection(collectionName);
        
        // Clear existing data (optional - remove if you want to keep existing)
        await collection.deleteMany({});
        console.log(`🗑️  Cleared ${collectionName} collection`);
        
        // Insert sample data
        const result = await collection.insertMany(documents);
        console.log(`✅ Inserted ${result.insertedCount} documents into ${collectionName}`);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Show database stats
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Database collections:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToMongoDB();
}

module.exports = { migrateToMongoDB };
