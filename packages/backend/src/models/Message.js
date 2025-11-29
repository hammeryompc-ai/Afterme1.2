import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'voice', 'video'],
      default: 'text'
    },
    mediaUrl: String,
    
    // Read receipts
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    
    // Reactions
    reactions: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        emoji: String
      }
    ],
    
    // Edits
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: Date
  },
  { timestamps: true }
)

messageSchema.index({ conversationId: 1, createdAt: -1 })

export default mongoose.model('Message', messageSchema)
