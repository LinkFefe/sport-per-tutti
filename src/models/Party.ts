import mongoose, { Schema, Document } from "mongoose";

// Definiamo l'interfaccia per TypeScript
export interface IParty extends Document {
  name: string;
  date: Date;
  location: string;
  description?: string; // 👈 Il punto di domanda dice a TypeScript che è opzionale
  imageUrl?: string;    // 👈 Idem qui
}

// Definiamo lo schema per MongoDB
const PartySchema = new Schema<IParty>(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    // 👇 Qui abbiamo impostato required: false
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
  },
  { timestamps: true }
);

// ⚠️ TRUCCO FONDAMENTALE PER LO SVILUPPO ⚠️
// Se il modello esiste già nella memoria del server, lo cancelliamo.
// Questo costringe Mongoose a ricrearlo con le nuove regole (required: false)
// ogni volta che salvi il file.
if (mongoose.models.Party) {
  delete mongoose.models.Party;
}

const Party = mongoose.model<IParty>("Party", PartySchema);

export default Party;