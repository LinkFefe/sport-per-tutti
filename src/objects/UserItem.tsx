"use client";

import { updateQuota } from "@/app/actions";
import { Minus, Plus, Trash2, User as UserIcon } from "lucide-react";
import { deleteUser } from "@/app/actions";

// Definiamo come è fatto un utente
interface UserProps {
  user: {
    _id: string;
    name: string;
    surname: string;
    quota: number;
  };
}

export default function UserItem({ user }: UserProps) {
  
  // Funzioni veloci per i bottoni
  const handleIncrease = async () => {
    await updateQuota(user._id, user.quota + 1);
  };

  const handleDecrease = async () => {
    await updateQuota(user._id, user.quota - 1);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-3">
      
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
                title="Decrease quota"
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-500 active:scale-95 transition"
            >
                <Minus size={14} />
            </button>
            
            <span className="font-bold text-lg text-gray-800 w-8 text-center">
                {user.quota}
            </span>

            <button 
                onClick={handleIncrease}
                title="Increase quota"
                className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-md shadow-sm text-white hover:bg-blue-700 active:scale-95 transition"
            >
                <Plus size={14} />
            </button>
        </div>

        {/* Tasto Elimina (piccolo cestino grigio) */}
        <form action={deleteUser}>
            <input type="hidden" name="id" value={user._id} />
            <button type="submit" title="Delete user" className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 transition">
                <Trash2 size={16} />
            </button>
        </form>

      </div>
    </div>
  );
}