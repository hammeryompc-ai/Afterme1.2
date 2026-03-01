import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  completedAt: Date
})

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['will', 'trust', 'insurance', 'medical', 'financial', 'property', 'other'],
    default: 'other'
  },
  fileUrl: String,
  notes: String,
  uploadedAt: { type: Date, default: Date.now }
})

const passwordEntrySchema = new mongoose.Schema({
  service: { type: String, required: true },
  username: String,
  encryptedPassword: String,
  notes: String
})

const documentVaultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    documents: [documentSchema],
    tasks: [taskSchema],
    executors: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: String,
        name: String,
        role: { type: String, enum: ['primary', 'backup'], default: 'primary' },
        acceptedAt: Date
      }
    ],
    passwords: [passwordEntrySchema],
    scheduledEvents: [
      {
        title: { type: String, required: true },
        description: String,
        scheduledAt: Date,
        type: { type: String, enum: ['reminder', 'deadline', 'meeting'], default: 'reminder' }
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('DocumentVault', documentVaultSchema)
