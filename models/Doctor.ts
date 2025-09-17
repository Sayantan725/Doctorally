// models/Doctor.ts
import mongoose, { Schema, models } from "mongoose";

const doctorSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const Doctor = models.Doctor || mongoose.model("Doctor", doctorSchema);
