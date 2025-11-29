import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    name: String,
    photoUrl: String,
    
    // Metadata
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map()
    },
    mutedBy: [mongoose.Schema.Types.ObjectId],
    archivedBy: [mongoose.Schema.Types.ObjectId]
  },
  { timestamps: true }
)

conversationSchema.index({ participants: 1 })

export default mongoose.model('Conversation', conversationSchema)
