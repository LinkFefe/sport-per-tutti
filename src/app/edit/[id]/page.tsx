import connectDB from "@/lib/db";
import Party from "@/models/Party";
import EditForm from "./EditForm";
import { notFound } from "next/navigation";
import mongoose from "mongoose"; 

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. Definiamo l'interfaccia per l'oggetto Party "trasformato"
// Questo sostituisce l'uso di "any"
interface PartyData {
  _id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  // keep index signature for any other fields coming from Mongo
  [key: string]: unknown;
}

export default async function EditPage({ params }: PageProps) {
  // 1. Aspettiamo di avere l'ID dalla URL
  const { id } = await params;

  // 🛡️ CONTROLLO DI SICUREZZA 🛡️
  if (!mongoose.isValidObjectId(id)) {
    return notFound();
  }

  // 2. Connettiamo al DB
  await connectDB();

  // 3. Cerchiamo la festa specifica
  const partyDoc = await Party.findById(id).lean();

  if (!partyDoc) {
    return notFound();
  }

  // 4. Convertiamo i dati strani di MongoDB
  // Usiamo 'as unknown as PartyData' per soddisfare TypeScript ed ESLint
  const party = {
    ...partyDoc,
    _id: partyDoc._id.toString(),
    date: partyDoc.date.toISOString(),
  } as unknown as PartyData;

  // 5. Mostriamo il form
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <EditForm party={party} />
    </div>
  );
}