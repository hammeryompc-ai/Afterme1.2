import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['financial', 'legal', 'medical', 'personal', 'estate', 'notification', 'other'],
      default: 'other'
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'blocked'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    dueDate: Date,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date,
    notes: String,
    // For executor collaboration
    executorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPreDeath: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export default mongoose.model('Task', taskSchema)
