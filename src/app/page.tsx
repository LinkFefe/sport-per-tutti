import connectDB from "@/lib/db";
import Party from "@/models/Party";
import { Home, Package, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import AddPartyButton from "@/objects/AddPartyButton";
import { revalidatePath } from "next/cache";

// 1. Interfaccia Frontend
interface PartyEvent {
  _id: string;
  name: string;
  date: string; 
  imageUrl: string;
  location: string;
  description?: string;
}

// 2. Interfaccia Raw
interface PartyRaw {
  _id: unknown;
  name: string;
  date: Date;
  imageUrl?: string;
  location: string;
  description?: string;
}

// --- SERVER ACTION PER ELIMINARE ---
async function deleteEvent(formData: FormData) {
  "use server";
  const id = formData.get("id");
  
  if (id) {
    await connectDB();
    await Party.findByIdAndDelete(id);
    revalidatePath("/");
  }
}

async function getParties(): Promise<PartyEvent[]> {
  await connectDB();
  const parties = await Party.find().sort({ date: 1 }).lean();

  return (parties as unknown as PartyRaw[]).map((party) => ({
    _id: String(party._id),
    name: party.name,
    date: party.date.toISOString(),
    imageUrl: party.imageUrl || "",
    location: party.location,
    description: party.description,
  }));
}

export default async function Page() {
  const parties = await getParties();

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      
      {/* --- INTESTAZIONE (HEADER) --- */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 p-3">
        <div className="max-w-md mx-auto flex justify-center items-center gap-16">
          <Link href="/" className="flex flex-col items-center text-blue-600">
            <Home size={26} />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Eventi</span>
          </Link>

          <Link href="/box" className="flex flex-col items-center text-gray-400 hover:text-blue-600 transition">
            <Package size={26} />
            <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">Boxs</span>
          </Link>
        </div>
      </header>

      {/* --- CORPO DELLA PAGINA --- */}
      <main className="pt-24 px-4 max-w-md mx-auto space-y-5">
        
        {/* TITOLO + PULSANTE INTELLIGENTE */}
        <div className="flex justify-between items-start mb-2 h-14">
            <h1 className="text-2xl font-bold text-gray-800 self-center">I tuoi Eventi</h1>
            <AddPartyButton count={parties.length} />
        </div>

        {/* LISTA FESTE */}
        {parties.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                <span className="text-3xl">+</span> 
            </div>
            <p className="font-medium text-gray-900">Nessun evento</p>
            <p className="text-sm mt-1 mb-4">Non hai ancora organizzato nessuna festa.</p>
          </div>
        ) : (
          parties.map((party) => (
            // Card container (NON è un link)
            <div key={party._id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
              
              {/* --- SEZIONE IMMAGINE (Statica) --- */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                {party.imageUrl ? (
                  <Image
                    src={party.imageUrl}
                    alt={party.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <span className="text-4xl">🎉</span>
                  </div>
                )}
                
                {/* Badge Data */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex flex-col items-center z-10">
                    <span className="text-red-500 uppercase text-[10px]">
                      {new Date(party.date).toLocaleDateString("it-IT", { month: "short" })}
                    </span>
                    <span className="text-lg leading-none text-gray-800">
                      {new Date(party.date).toLocaleDateString("it-IT", { day: "numeric" })}
                    </span>
                </div>
              </div>

              {/* --- CONTENUTO CARD --- */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    {/* Titolo (Statico) */}
                    <h2 className="text-xl font-bold text-gray-900 flex-1 pr-2">{party.name}</h2>

                    {/* --- BOTTONI AZIONE --- */}
                    <div className="flex items-center gap-2 shrink-0">
                      
                      {/* Tasto Modifica (Unico Link di navigazione) */}
                      <Link 
                        href={`/edit/${party._id}`}
                        className="text-white text-xs bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-1 shadow-sm font-medium"
                      >
                        ✏️ Modifica
                      </Link>

                      {/* Tasto Elimina (Server Action) */}
                      <form action={deleteEvent}>
                        <input type="hidden" name="id" value={party._id} />
                        <button 
                          type="submit" 
                          className="text-gray-400 text-xs bg-gray-100 px-2 py-1.5 rounded-lg hover:text-red-600 hover:bg-red-50 transition flex items-center justify-center border border-gray-200"
                          title="Elimina evento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>

                    </div>
                </div>
                
                {/* Luogo */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <span>📍 {party.location}</span>
                    </div>
                </div>

                {/* Descrizione */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {party.description || "Nessun dettaglio aggiuntivo."}
                </p>
                
                {/* Footer (Solo orario, non cliccabile) */}
                <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 font-semibold flex items-center gap-1">
                    <span>⏰ Ore {new Date(party.date).toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}