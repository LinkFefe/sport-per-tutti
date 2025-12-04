"use client";

import { updateParty, deleteParty } from "@/app/actions";
import { ArrowLeft, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image"; // 👈 Importiamo il componente Image

// Definiamo che tipo di dati ci aspettiamo dal database
interface EditFormProps {
  party: {
    _id: string;
    name: string;
    date: string; // Arriverà come stringa ISO
    location: string;
    description: string;
    imageUrl: string;
  };
}

export default function EditForm({ party }: EditFormProps) {
  // 1. Prepariamo le date per i campi input HTML (che sono schizzinosi)
  const dateObj = new Date(party.date);
  
  // Estrae YYYY-MM-DD per l'input type="date"
  const defaultDate = dateObj.toISOString().split("T")[0];
  
  // Estrae HH:MM per l'input type="time"
  const defaultTime = dateObj.toLocaleTimeString("it-IT", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });

  // 2. Stato per l'anteprima live dell'immagine
  const [previewUrl, setPreviewUrl] = useState(party.imageUrl);

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      
      {/* --- INTESTAZIONE (Indietro + Elimina) --- */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="flex items-center text-gray-400 hover:text-gray-800 transition">
          <ArrowLeft size={18} className="mr-2" /> Annulla
        </Link>
        
        {/* Pulsante Elimina (è un form separato per sicurezza) */}
        <form action={deleteParty}>
            <input type="hidden" name="id" value={party._id} />
            <button 
                type="submit" 
                className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                onClick={(e) => {
                    if(!confirm("Sei sicuro di voler eliminare questa festa?")) {
                        e.preventDefault();
                    }
                }}
            >
                <Trash2 size={16} /> Elimina
            </button>
        </form>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-gray-900">Modifica Evento ✏️</h1>

      {/* --- MODULO PRINCIPALE DI MODIFICA --- */}
      <form action={updateParty} className="space-y-5">
        
        {/* ⚠️ FONDAMENTALE: Passiamo l'ID nascosto al server */}
        <input type="hidden" name="id" value={party._id} />

        {/* Nome */}
        <div>
          <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Titolo Evento</label>
          <input 
            id="name"
            name="name" 
            type="text" 
            required 
            placeholder="Es: Capodanno 2025"
            title="Titolo dell'evento"
            defaultValue={party.name} 
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition" 
          />
        </div>

        {/* Data e Ora */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="date" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data</label>
            <input 
                id="date"
                name="date" 
                type="date" 
                required 
                defaultValue={defaultDate}
                title="Data dell'evento (anno-mese-giorno)"
                aria-label="Data dell'evento"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>
          <div className="w-1/3">
             <label htmlFor="time" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ora</label>
             <input 
                id="time"
                name="time" 
                type="time" 
                required 
                defaultValue={defaultTime}
                title="Ora dell'evento (formato 24h)"
                aria-label="Ora dell'evento"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition" 
            />
          </div>
        </div>

        {/* Luogo */}
        <div>
          <label htmlFor="location" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Luogo</label>
          <input 
            id="location"
            name="location"
            type="text"
            placeholder="Es: Casa mia"
            title="Luogo dell'evento"
            aria-required="true"
            required
            defaultValue={party.location} 
            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition" 
          />
        </div>

        {/* Immagine con Anteprima */}
        <div>
            <label htmlFor="imageUrl" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Link Immagine</label>
            <div className="relative">
                <input 
                    id="imageUrl"
                    name="imageUrl" 
                    type="url"  
                    placeholder="https://..."
                    title="URL immagine dell'evento"
                    defaultValue={party.imageUrl}
                    onChange={(e) => setPreviewUrl(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition" 
                />
                <ImageIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>

            {previewUrl && (
                <div className="mt-4 relative h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
                    {/* QUI LA MODIFICA PRINCIPALE:
                       Usiamo Image con 'fill' e 'unoptimized'
                    */}
                    <Image 
                        src={previewUrl} 
                        alt="Anteprima" 
                        fill
                        unoptimized // Permette di caricare URL esterni senza configurarli
                        className="object-cover" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center backdrop-blur-sm z-10">
                        Nuova Anteprima
                    </div>
                </div>
            )}
        </div>

        {/* Descrizione (Textarea corretta) */}
        <div>
          <label htmlFor="description" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrizione</label>
          <textarea 
              id="description"
              name="description" 
              rows={3} 
              placeholder="Descrivi i dettagli della festa..."
              title="Descrizione dell'evento"
              defaultValue={party.description} 
              className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition"
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition active:scale-95 mt-4">
          Salva Modifiche
        </button>
      </form>
    </div>
  );
}