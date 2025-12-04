import connectDB from "@/lib/db";
import Party from "@/models/Party";
import EditForm from "../../../objects/EditForm";
import { notFound } from "next/navigation";
import mongoose from "mongoose"; 

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. Definiamo l'interfaccia precisa che passeremo al form
export interface PartyData {
  _id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
}

export default async function EditPage({ params }: PageProps) {
  // 1. Aspettiamo di avere l'ID dalla URL
  const { id } = await params;

  // 🛡️ CONTROLLO DI SICUREZZA
  if (!mongoose.isValidObjectId(id)) {
    return notFound();
  }

  // 2. Connettiamo al DB
  await connectDB();

  // 3. Cerchiamo la festa specifica
  // Assegnamo : any per poter leggere le proprietà liberamente nel blocco successivo
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const partyDoc: any = await Party.findById(id).lean();

  if (!partyDoc) {
    return notFound();
  }

  // 4. Trasformazione manuale (più sicura dello spread operator ...partyDoc)
  const party: PartyData = {
    _id: partyDoc._id.toString(),
    name: partyDoc.name,
    // Gestiamo il caso in cui date sia stringa o oggetto Date
    date: new Date(partyDoc.date).toISOString(), 
    location: partyDoc.location,
    description: partyDoc.description || "",
    imageUrl: partyDoc.imageUrl || "",
  };

  // 5. Mostriamo il form
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <EditForm party={party} />
    </div>
  );
}