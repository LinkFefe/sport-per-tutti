"use client"; // Importante: rende questo componente interattivo

import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeletePartyButtonProps {
  id: string;
  deleteAction: (id: string) => Promise<void>; // Accettiamo la Server Action come prop
}

export default function DeletePartyButton({ id, deleteAction }: DeletePartyButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // IL POPUP DI CONFERMA NATIVO
    const confirmed = window.confirm("Sei sicuro di voler eliminare questo evento? L'azione è irreversibile.");

    if (confirmed) {
      setIsDeleting(true);
      await deleteAction(id); // Chiama la funzione del server
      // Non serve rimettere false perché la pagina si ricaricherà
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-gray-400 text-xs bg-gray-100 px-2 py-1.5 rounded-lg hover:text-red-600 hover:bg-red-50 transition flex items-center justify-center border border-gray-200 disabled:opacity-50"
      title="Elimina evento"
    >
      {isDeleting ? (
        // Spinner semplice mentre elimina
        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}