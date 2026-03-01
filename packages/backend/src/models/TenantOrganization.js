import mongoose from 'mongoose'

const tenantOrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['government', 'nonprofit', 'ngo', 'healthcare', 'education'],
      default: 'nonprofit'
    },
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: String,
        role: { type: String, enum: ['admin', 'staff', 'viewer'], default: 'viewer' },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    programs: [
      {
        name: { type: String, required: true },
        description: String,
        grantAmount: Number,
        currency: { type: String, default: 'USD' },
        startDate: Date,
        endDate: Date,
        status: { type: String, enum: ['active', 'completed', 'pending'], default: 'pending' },
        beneficiaryCount: { type: Number, default: 0 }
      }
    ],
    grantReports: [
      {
        programId: mongoose.Schema.Types.ObjectId,
        reportTitle: String,
        period: String,
        content: String,
        submittedAt: Date,
        status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' }
      }
    ],
    dashboardConfig: {
      widgets: [String],
      customBranding: {
        logoUrl: String,
        primaryColor: String
      }
    },
    consentFramework: {
      requireExplicitConsent: { type: Boolean, default: true },
      consentVersion: { type: String, default: '1.0' },
      consentText: String,
      consentsRecorded: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          consentedAt: Date,
          version: String,
          ipAddress: String
        }
      ]
    },
    tenantDomain: String,
    ssoConfig: {
      enabled: { type: Boolean, default: false },
      provider: String,
      entryPoint: String,
      certificate: String
    }
  },
  { timestamps: true }
)

export default mongoose.model('TenantOrganization', tenantOrganizationSchema)
