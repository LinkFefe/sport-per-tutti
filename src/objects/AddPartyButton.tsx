"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// 👇 DEVE ESSERE 'export default function'
export default function AddPartyButton({ count }: { count: number }) {
  const [showError, setShowError] = useState(false);
  const MAX_EVENTS = 5;
  const isLimitReached = count >= MAX_EVENTS;

  if (isLimitReached) {
    return (
      <div className="flex flex-col items-end relative">
        <button 
          onClick={() => setShowError(true)}
          className="bg-gray-300 text-gray-500 text-sm font-medium px-4 py-2 rounded-full flex items-center shadow-none cursor-not-allowed"
        >
          <Plus size={16} className="mr-1" /> Aggiungi evento
        </button>
        {showError && (
          <p className="text-[10px] text-red-500 font-bold mt-1 absolute top-full right-0 w-max animate-bounce">
            Raggiunto numero massimo di eventi!
          </p>
        )}
      </div>
    );
  }

  return (
    <Link 
      href="/create" 
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center shadow-md transition active:scale-95"
    >
      <Plus size={16} className="mr-1" /> Aggiungi evento
    </Link>
  );
}