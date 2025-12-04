import connectDB from "@/lib/db";
import Party from "@/models/Party";
import EditForm from "./EditForm";
import { notFound } from "next/navigation";
import mongoose from "mongoose"; // 👈 Importiamo mongoose per il controllo

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps) {
  // 1. Aspettiamo di avere l'ID dalla URL
  const { id } = await params;

  // 🛡️ CONTROLLO DI SICUREZZA 🛡️
  // Verifichiamo se l'ID è valido per MongoDB.
  // Se l'utente scrive "h" o "ciao" o numeri a caso, lo mandiamo alla pagina 404.
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
  const party = {
    ...partyDoc,
    _id: partyDoc._id.toString(),
    date: partyDoc.date.toISOString(),
  } as any;

  // 5. Mostriamo il form
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <EditForm party={party} />
    </div>
  );
}