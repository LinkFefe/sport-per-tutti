import connectDB from "@/lib/db";
import Party from "@/models/Party";
import { Home, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import AddPartyButton from "@/objects/AddPartyButton";

// 1. Interfaccia per i dati che vanno al Frontend (l'app)
interface PartyEvent {
  _id: string;
  name: string;
  date: string; 
  imageUrl: string;
  location: string;
  description?: string;
}

// 2. Interfaccia per i dati che arrivano "grezzi" dal Database
// (Serve per togliere l'any dal map)
interface PartyRaw {
  _id: unknown;    // L'ID di Mongoose è un oggetto complesso, lo tratteremo come unknown poi convertito
  name: string;
  date: Date;      // Dal DB arriva come oggetto Date
  imageUrl?: string;
  location: string;
  description?: string;
}

async function getParties(): Promise<PartyEvent[]> {
  await connectDB();
  
  // Recuperiamo i dati. 
  // Usiamo 'unknown' o un cast esplicito per evitare problemi con i tipi di Mongoose
  const parties = await Party.find().sort({ date: 1 }).lean();

  // Qui mappiamo i dati grezzi (PartyRaw) nel formato pulito (PartyEvent)
  return (parties as unknown as PartyRaw[]).map((party) => ({
    _id: String(party._id),          // Convertiamo l'ID in stringa sicura
    name: party.name,
    date: party.date.toISOString(),  // Convertiamo la data in stringa
    imageUrl: party.imageUrl || "",  // Se manca, stringa vuota per sicurezza
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
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Home</span>
          </Link>

          <Link href="/box" className="flex flex-col items-center text-gray-400 hover:text-blue-600 transition">
            <Package size={26} />
            <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">Gestisci</span>
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
            <Link href={`/edit/${party._id}`} key={party._id} className="block group">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition cursor-pointer relative">
                
                {/* --- SEZIONE IMMAGINE --- */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  {party.imageUrl ? (
                    <Image
                      src={party.imageUrl}
                      alt={party.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-4xl">🎉</span>
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm flex flex-col items-center z-10">
                      <span className="text-red-500 uppercase text-[10px]">
                        {new Date(party.date).toLocaleDateString("it-IT", { month: "short" })}
                      </span>
                      <span className="text-lg leading-none text-gray-800">
                        {new Date(party.date).toLocaleDateString("it-IT", { day: "numeric" })}
                      </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{party.name}</h2>
                      <span className="text-gray-300 text-xs bg-gray-50 px-2 py-1 rounded-full group-hover:text-blue-500 group-hover:bg-blue-50 transition">✏️ Modifica</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 mt-2">
                      <div className="flex items-center gap-1">
                        <span>📍 {party.location}</span>
                      </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {party.description || "Nessun dettaglio aggiuntivo."}
                  </p>
                  
                  <div className="pt-3 border-t border-gray-100 text-xs text-blue-600 font-semibold flex items-center justify-between">
                      <span>⏰ Ore {new Date(party.date).toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="text-gray-400 font-normal">Clicca per dettagli →</span>
                   </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}