/**
 * Message Migration Script
 * 
 * Migrates messages from the old `Message` collection to `WhaleMessage`.
 * This is a one-time migration to preserve existing chat history after
 * implementing multi-room support.
 * 
 * Usage:
 *   npx ts-node scripts/migrate-messages.ts
 * 
 * Prerequisites:
 *   - MONGODB_URI environment variable must be set
 *   - Run from socket-server directory
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is required');
  process.exit(1);
}

// Now TypeScript knows MONGODB_URI is definitely a string

// Schema definitions (must match the server)
const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  users: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
  }],
}, { _id: false });

const replySchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  senderName: { type: String, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String },
  nftCount: { type: Number, required: true },
  replyTo: { type: replySchema, default: null },
  reactions: { type: [reactionSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Models - old collection and new collection
const Message = mongoose.model('Message', messageSchema, 'messages');
const WhaleMessage = mongoose.model('WhaleMessage', messageSchema, 'whalemessages');

async function migrate() {
  console.log('🔄 Starting message migration...');
  console.log(`📡 Connecting to MongoDB...`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Count existing messages in both collections
    const oldCount = await Message.countDocuments();
    const existingWhaleCount = await WhaleMessage.countDocuments();
    
    console.log(`📊 Found ${oldCount} messages in old 'Message' collection`);
    console.log(`📊 Found ${existingWhaleCount} messages in 'WhaleMessage' collection`);
    
    if (oldCount === 0) {
      console.log('ℹ️  No messages to migrate');
      return;
    }
    
    if (existingWhaleCount > 0) {
      console.log('⚠️  WhaleMessage collection already has messages');
      console.log('   This might indicate migration was already run.');
      console.log('   Proceeding will add duplicates. Checking for duplicates...');
      
      // Get IDs of existing whale messages
      const existingIds = new Set(
        (await WhaleMessage.find({}, { _id: 1 }).lean()).map(m => m._id.toString())
      );
      
      // Get old messages that aren't already migrated
      const oldMessages = await Message.find({}).lean();
      const newMessages = oldMessages.filter(m => !existingIds.has(m._id.toString()));
      
      if (newMessages.length === 0) {
        console.log('✅ All messages already migrated');
        return;
      }
      
      console.log(`📝 Found ${newMessages.length} new messages to migrate`);
      
      // Insert only new messages
      const result = await WhaleMessage.insertMany(newMessages, { ordered: false });
      console.log(`✅ Migrated ${result.length} messages to WhaleMessage collection`);
    } else {
      // Fresh migration - copy all messages
      const oldMessages = await Message.find({}).lean();
      
      console.log(`📝 Migrating ${oldMessages.length} messages...`);
      
      const result = await WhaleMessage.insertMany(oldMessages);
      console.log(`✅ Migrated ${result.length} messages to WhaleMessage collection`);
    }
    
    // Verify migration
    const finalCount = await WhaleMessage.countDocuments();
    console.log(`📊 WhaleMessage collection now has ${finalCount} messages`);
    
    console.log('\n🎉 Migration complete!');
    console.log('\nNote: The old Message collection is preserved.');
    console.log('You can manually delete it later if needed.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

migrate();
