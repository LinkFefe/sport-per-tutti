import { createParty } from "../actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        
        {/* Tasto Indietro */}
        <Link href="/" className="flex items-center text-gray-500 mb-6 hover:text-gray-800">
          <ArrowLeft size={20} className="mr-2" /> Torna alla Home
        </Link>

        <h1 className="text-2xl font-bold mb-6 text-gray-900">Nuova Festa 🎉</h1>

        {/* IL MODULO */}
        {/* action={createParty} collega il form direttamente alla funzione che abbiamo creato prima */}
        <form action={createParty} className="space-y-4">
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Evento</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Es: Capodanno 2025"
              title="Nome dell'evento"
              aria-required="true"
              className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                id="date"
                name="date"
                type="date"
                required
                placeholder="YYYY-MM-DD"
                title="Data dell'evento (anno-mese-giorno)"
                aria-label="Data dell'evento"
                aria-required="true"
                className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <div className="w-1/3">
               <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
               <input
                 id="time"
                 name="time"
                 type="time"
                 required
                 placeholder="HH:MM"
                 title="Ora dell'evento (24h)"
                 aria-label="Ora dell'evento"
                 aria-required="true"
                 className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
               />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Luogo</label>
            <input
              id="location"
              name="location"
              type="text"
              required
              placeholder="Es: Casa mia"
              title="Luogo dell'evento"
              aria-required="true"
              className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Link Immagine (URL)</label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://..."
              title="URL immagine dell'evento"
              aria-required="true"
              className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
            />
            <p className="text-xs text-gray-400 mt-1">Copia un link da Google Immagini</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Dettagli..."
              title="Descrizione dell'evento"
              aria-required="true"
              className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900"
            ></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition mt-4">
            Salva Festa
          </button>
        </form>
      </div>
    </div>
  );
}