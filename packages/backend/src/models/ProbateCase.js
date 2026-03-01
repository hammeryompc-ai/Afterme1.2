import mongoose from 'mongoose'

const probateCaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deceasedName: { type: String, required: true },
    deceasedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    caseNumber: { type: String, unique: true },
    jurisdiction: String,
    status: {
      type: String,
      enum: ['opened', 'in_progress', 'pending_court', 'closed', 'contested'],
      default: 'opened'
    },
    steps: [
      {
        order: { type: Number, required: true },
        title: { type: String, required: true },
        description: String,
        status: { type: String, enum: ['pending', 'in_progress', 'complete', 'blocked'], default: 'pending' },
        completedAt: Date,
        notes: String
      }
    ],
    beneficiaries: [
      {
        name: { type: String, required: true },
        email: String,
        phone: String,
        relationship: String,
        allocationPercent: Number,
        assets: [String],
        notified: { type: Boolean, default: false },
        notifiedAt: Date,
        accepted: { type: Boolean, default: false }
      }
    ],
    generatedForms: [
      {
        formType: { type: String, required: true },
        title: String,
        fileUrl: String,
        generatedAt: { type: Date, default: Date.now },
        signed: { type: Boolean, default: false },
        signedAt: Date
      }
    ],
    evidenceVault: [
      {
        title: { type: String, required: true },
        type: { type: String, enum: ['death_certificate', 'will', 'deed', 'financial', 'correspondence', 'other'] },
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false }
      }
    ],
    communicationTemplates: [
      {
        name: String,
        subject: String,
        body: String,
        recipientType: { type: String, enum: ['beneficiary', 'court', 'bank', 'creditor'] },
        sentAt: Date
      }
    ],
    attorneys: [
      {
        name: String,
        email: String,
        phone: String,
        barNumber: String
      }
    ]
  },
  { timestamps: true }
)

probateCaseSchema.pre('save', function (next) {
  if (!this.caseNumber) {
    this.caseNumber = `PRB-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }
  next()
})

export default mongoose.model('ProbateCase', probateCaseSchema)
