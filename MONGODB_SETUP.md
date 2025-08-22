# MongoDB Setup Guide for SOS App

## Prerequisites
- Node.js installed on your system
- MongoDB Community Server installed
- MongoDB Compass (GUI tool) installed

## Step 1: Install MongoDB Community Server

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer (.msi file)
3. Choose "Complete" installation
4. Install MongoDB Compass when prompted
5. Complete the installation

### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

### Linux (Ubuntu):
```bash
sudo apt-get install mongodb
```

## Step 2: Start MongoDB Service

### Windows:
- MongoDB should start automatically as a Windows service
- Check Services app → MongoDB Server → Running

### macOS:
```bash
brew services start mongodb/brew/mongodb-community
```

### Linux:
```bash
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Step 3: Verify MongoDB is Running

Open a terminal/command prompt and run:
```bash
mongosh
```

You should see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017/
Using MongoDB: 7.0.x
...
```

Type `exit` to close.

## Step 4: Install MongoDB Compass (GUI)

1. Download from: https://www.mongodb.com/try/download/compass
2. Install and open MongoDB Compass
3. Connect to: `mongodb://localhost:27017`
4. Click "Connect"

## Step 5: Create Database

1. In MongoDB Compass, click "Create Database"
2. Database Name: `sos_app`
3. Collection Name: `users`
4. Click "Create Database"

## Step 6: Update Connection String

Edit `src/lib/mongodb.ts` and update the connection string if needed:

```typescript
// For local MongoDB
const MONGODB_URI = 'mongodb://localhost:27017/sos_app';

// For MongoDB Atlas (cloud)
const MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/sos_app';
```

## Step 7: Run Migration Script

```bash
node migrate-to-mongodb.js
```

This will create sample collections and data.

## Step 8: Test the Connection

1. Start your app: `npm run dev`
2. Check browser console for "✅ MongoDB connected successfully"
3. If you see errors, check MongoDB service is running

## Step 9: Create Collections in Compass

In MongoDB Compass, create these collections:
- `users` - User accounts
- `profiles` - User profile information
- `notifications` - User notifications
- `emergencies` - Emergency reports
- `friend_requests` - Friend requests
- `friends` - Friend relationships

## Step 10: Update Your App Code

You'll need to gradually replace Firebase functions with MongoDB functions:

### Before (Firebase):
```typescript
import { collection, addDoc } from 'firebase/firestore';
await addDoc(collection(db, 'users'), userData);
```

### After (MongoDB):
```typescript
import { createUser } from './lib/mongoUtils';
await createUser(userData);
```

## Troubleshooting

### MongoDB won't start:
- Check if port 27017 is available
- Ensure you have admin privileges
- Check Windows Services (if on Windows)

### Connection refused:
- MongoDB service not running
- Wrong port number
- Firewall blocking connection

### Authentication failed:
- Check username/password in connection string
- Ensure user has proper permissions

## Next Steps

1. **Test basic operations**: Create, read, update, delete users
2. **Migrate existing data**: Export from Firebase, import to MongoDB
3. **Update all components**: Replace Firebase calls with MongoDB calls
4. **Test thoroughly**: Ensure all features work with new database

## Data Structure

Your MongoDB collections will look like this:

```javascript
// users collection
{
  _id: ObjectId("..."),
  email: "user@example.com",
  displayName: "User Name",
  phone: "+1234567890",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}

// profiles collection
{
  _id: ObjectId("..."),
  userId: "user_id_here",
  full_name: "User Name",
  email: "user@example.com",
  phone: "+1234567890",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

## Need Help?

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Compass Guide: https://docs.mongodb.com/compass/
- Node.js MongoDB Driver: https://mongodb.github.io/node-mongodb-native/
