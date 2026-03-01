import mongoose from 'mongoose'

const estateCaseSchema = new mongoose.Schema(
  {
    deceasedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    executorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    caseStatus: {
      type: String,
      enum: ['open', 'in_progress', 'pending_court', 'closed'],
      default: 'open'
    },
    // Beneficiaries
    beneficiaries: [
      {
        name: String,
        email: String,
        relationship: String,
        share: Number,
        contactedAt: Date,
        status: {
          type: String,
          enum: ['pending', 'notified', 'confirmed', 'disputed'],
          default: 'pending'
        }
      }
    ],
    // Probate steps
    steps: [
      {
        stepNumber: Number,
        title: String,
        description: String,
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed', 'skipped'],
          default: 'pending'
        },
        dueDate: Date,
        completedAt: Date,
        notes: String,
        generatedFormUrl: String
      }
    ],
    // Evidence vault
    evidenceDocuments: [
      {
        title: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    // Communications
    communicationLog: [
      {
        recipient: String,
        subject: String,
        body: String,
        sentAt: { type: Date, default: Date.now },
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    courtFilingDate: Date,
    closedAt: Date
  },
  { timestamps: true }
)

export default mongoose.model('EstateCase', estateCaseSchema)
