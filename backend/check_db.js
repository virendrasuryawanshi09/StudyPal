import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Document from './models/Document.js';

async function check() {
    await connectDB();
    const docs = await Document.find().sort({ createdAt: -1 }).limit(1);
    if (docs.length > 0) {
        console.log('Document filePath:', docs[0].filePath);
    } else {
        console.log('No documents found.');
    }
    process.exit(0);
}

check();
