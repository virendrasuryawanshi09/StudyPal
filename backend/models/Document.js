import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title for the document'],
        trim: true,
    },
    fileName: {
        type: String,
        required: [true, 'Please add a file name for the document'],
        trim: true,
    },
    filePath: {
        type: String,
        required: [true, 'Please add a file path for the document'],
        trim: true,
    },
    fileSize: {
        type: Number,
        required: [true, 'Please add a file size for the document'],
    },
    extractedText: {
        type: String,
        required: [true, 'Please add extracted text for the document'],
        trim: true,
    },
    chunks: [{
        content: {
            type: String,
            required: true,
            trim: true,
        },
        pageNumber: {
            type: Number,
            required: true,
        },
        chunkIndex: {
            type: Number,
            required: true,
        },
    }],
    uploadDate: {
        type: Date,
        default: Date.now,
    },
    lastAccessed: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ['processing', 'ready', 'failed'],
        default: 'processing',
    },
}, {
    timestamps: true,
});


// Index for faster queries

DocumentSchema.index({ userId: 1, uploadDate: -1 });

const Document = mongoose.model('Document', DocumentSchema);
export default Document;