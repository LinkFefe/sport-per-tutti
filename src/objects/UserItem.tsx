"use client";

import { updateQuota, deleteUser } from "@/app/actions";
import { Minus, Plus, Trash2, User as UserIcon } from "lucide-react";

// Definiamo come è fatto un utente
interface UserProps {
  user: {
    _id: string;
    name: string;
    surname: string;
    // Manteniamo 'any' per compatibilità col tuo codice attuale
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    quota: any; 
  };
}

export default function UserItem({ user }: UserProps) {
  
  // Funzioni veloci per i bottoni quota
  const handleIncrease = async () => {
    await updateQuota(user._id, Number(user.quota) + 1);
  };

  const handleDecrease = async () => {
    await updateQuota(user._id, Number(user.quota) - 1);
  };

  // --- NUOVA FUNZIONE DI CONFERMA ELIMINAZIONE ---
  const handleDelete = (e: React.FormEvent) => {
    // Mostra il popup nativo del browser
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare ${user.name} ${user.surname}?`
    );

    // Se l'utente clicca "Annulla", blocchiamo l'invio del form
    if (!confirmed) {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-3 hover:shadow-md transition duration-200">
      
      {/* Info Utente */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-50 p-2 rounded-full text-blue-600">
            <UserIcon size={20} />
        </div>
        <div>
            <h3 className="font-bold text-gray-900 leading-tight">{user.name} {user.surname}</h3>
            <p className="text-xs text-gray-400">Partecipante</p>
        </div>
      </div>

      {/* Controlli (+ / -) */}
      <div className="flex items-center gap-2">
        
        {/* Gruppo Contatore */}
        <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button 
                onClick={handleDecrease}
                title="Diminuisci quota"
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-500 active:scale-95 transition"
            >
                <Minus size={14} />
            </button>
            
            <span className="font-bold text-lg text-gray-800 w-8 text-center select-none">
                {user.quota}
            </span>

            <button 
                onClick={handleIncrease}
                title="Aumenta quota"
                className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-md shadow-sm text-white hover:bg-blue-700 active:scale-95 transition"
            >
                <Plus size={14} />
            </button>
        </div>

        {/* Tasto Elimina con Conferma */}
        {/* Aggiunto onSubmit={handleDelete} */}
        <form action={deleteUser} onSubmit={handleDelete}>
            <input type="hidden" name="id" value={user._id} />
            <button 
                type="submit" 
                title="Elimina partecipante" 
                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            >
                <Trash2 size={16} />
            </button>
        </form>

      </div>
    </div>
  );
}