const { MongoClient } = require('mongodb');

async function testMongoDB() {
  const uri = 'mongodb://localhost:27017/sos_app';
  const client = new MongoClient(uri);

  try {
    console.log('🔌 Testing MongoDB connection...');
    
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Get database
    const db = client.db('sos_app');
    console.log('📊 Database:', db.databaseName);
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    // Test basic operations
    const testCollection = db.collection('test');
    
    // Insert a test document
    const insertResult = await testCollection.insertOne({
      message: 'Hello MongoDB!',
      timestamp: new Date()
    });
    console.log('✅ Insert test document:', insertResult.insertedId);
    
    // Find the document
    const findResult = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Find test document:', findResult);
    
    // Delete the test document
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Delete test document:', deleteResult.deletedCount, 'document(s) deleted');
    
    console.log('🎉 All MongoDB tests passed!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure MongoDB is running');
      console.log('2. Check if port 27017 is available');
      console.log('3. On Windows, check Services app for MongoDB');
      console.log('4. Try: mongosh (in terminal) to test connection');
    }
    
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

// Run the test
testMongoDB();
