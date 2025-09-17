import mongoose, { Schema, models } from 'mongoose';

const imageSchema = new Schema(
  {
    userId:   { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    imageKey: { type: String, required: true },
    imageUrl: { type: String, required: true },
    summary:  { type: String, required: true },

    reportName:  { type: String },
    reportDate:  { type: Date },
    doctorId:    { type: Schema.Types.ObjectId, ref: "Doctor" },
  },
  {
    timestamps: { createdAt: 'uploadedAt', updatedAt: false },
  }
);

export const Image = models.Image || mongoose.model('Image', imageSchema);