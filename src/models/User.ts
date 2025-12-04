import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  surname: string;
  quota: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    quota: { type: Number, default: 0 }, // Se non specifichi nulla, parte da 0
  },
  { timestamps: true }
);

// Codice per cancellare la cache (come abbiamo fatto per Party)
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);