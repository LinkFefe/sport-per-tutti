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
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return notFound();
  }  
  await connectDB();
  const partyDoc: any = await Party.findById(id).lean();
  if (!partyDoc) {
    return notFound();
  }

  const party: PartyData = {
    _id: partyDoc._id.toString(),
    name: partyDoc.name,
    // Gestiamo il caso in cui date sia stringa o oggetto Date
    date: new Date(partyDoc.date).toISOString(), 
    location: partyDoc.location,
    description: partyDoc.description || "",
    imageUrl: partyDoc.imageUrl || "",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <EditForm party={party} />
    </div>
  );
}