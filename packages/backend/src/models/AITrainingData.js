import mongoose from 'mongoose'

const aiTrainingDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['personality', 'voice', 'text_sample'],
      required: true
    },
    data: mongoose.Schema.Types.Mixed,
    audioUrl: String,
    transcription: String,
    processed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export default mongoose.model('AITrainingData', aiTrainingDataSchema)
