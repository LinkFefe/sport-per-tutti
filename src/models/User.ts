import mongoose, { Schema, Document } from "mongoose";

// Interfaccia per i singoli feedback nello storico quota
export interface IQuotaFeedback {
  timestamp: Date;
  // valori espliciti per le due quote al momento della modifica
  baseQuota?: number;
  quota?: number;
  // differenza opzionale per compatibilità
  difference?: number;
  field?: string; // quale campo è stato modificato: 'quota' o 'baseQuota' (legacy)
}

export interface IUser extends Document {
  name: string;
  surname: string;
  quota: number;
  baseQuota?: number;
  quotaHistory?: IQuotaFeedback[];
}

const QuotaFeedbackSchema = new Schema<IQuotaFeedback>(
  {
    timestamp: { type: Date, required: true },
    baseQuota: { type: Number, required: false },
    quota: { type: Number, required: false },
    difference: { type: Number, required: false },
    field: { type: String, required: false },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    quota: { type: Number, default: 0 },
    baseQuota: { type: Number, default: 0 },
    quotaHistory: { type: [QuotaFeedbackSchema], default: [] },
  },
  { timestamps: true }
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);