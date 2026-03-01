import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: String,
  performedAt: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed
})

const bankPartnershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    partnerName: { type: String, required: true },
    partnerCode: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'in_review', 'verified', 'rejected'],
      default: 'pending'
    },
    verificationDocuments: [
      {
        type: String,
        fileUrl: String,
        submittedAt: { type: Date, default: Date.now }
      }
    ],
    ssoEnabled: { type: Boolean, default: false },
    ssoProvider: String,
    auditLogs: [auditLogSchema],
    estateTransfers: [
      {
        assetDescription: { type: String, required: true },
        estimatedValue: Number,
        currency: { type: String, default: 'USD' },
        status: {
          type: String,
          enum: ['pending', 'initiated', 'in_progress', 'complete', 'rejected'],
          default: 'pending'
        },
        beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        beneficiaryName: String,
        initiatedAt: Date,
        completedAt: Date
      }
    ],
    complianceFlags: [
      {
        flag: String,
        severity: { type: String, enum: ['low', 'medium', 'high'] },
        resolvedAt: Date
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('BankPartnership', bankPartnershipSchema)
