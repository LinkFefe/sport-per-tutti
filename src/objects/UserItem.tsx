"use client";

import { updateQuotas, deleteUser } from "@/app/actions";
import { Trash2, User as UserIcon, Save, Clock, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";

const MAX_FEEDBACKS = 20;

// Aggiornata per accettare stringa o oggetto Date
interface Feedback {
  timestamp: Date | string;
  baseQuota?: number;
  quota?: number;
  difference?: number;
}

interface UserProps {
  user: {
    _id: string;
    name: string;
    surname: string;
    quota: any; 
    // AGGIUNTO: La storia della quota, recuperata dal database.
    quotaHistory?: Feedback[]; 
  };
  isAdmin?: boolean;
}

// Funzione helper per convertire timestamp in Date e ordinare
const mapHistory = (history: Feedback[] | undefined): Feedback[] => {
    if (!history) return [];
    
    return history.map(item => ({
        ...item,
        // Converte in Date per la visualizzazione
        timestamp: new Date(item.timestamp),
    })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Ordina dal più recente
};


export default function UserItem({ user, isAdmin = false }: UserProps) {
  
  const initialQuota = Number(user.quota) || 0;
  const initialBaseQuota = Number((user as any).baseQuota ?? user.quota) || 0;
  const [baseQuota, setBaseQuota] = useState(initialBaseQuota);
  const [currentQuota, setCurrentQuota] = useState(initialQuota);
  const [isSaving, setIsSaving] = useState(false);
  
  // AGGIUSTATO: Inizializza lo stato dello storico con i dati ricevuti dal server
  const initialHistory = mapHistory(user.quotaHistory);
  const [saveHistory, setSaveHistory] = useState<Feedback[]>(initialHistory); 
  
  // STATO NUOVO: Traccia la visibilità dello storico
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  const isDirty = useMemo(() => currentQuota !== initialQuota || baseQuota !== initialBaseQuota, [currentQuota, initialQuota, baseQuota, initialBaseQuota]);

  const handleQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuota = parseInt(e.target.value, 10);
    if (!isNaN(newQuota)) {
      setCurrentQuota(newQuota);
    } else {
      // Allow clearing to 0
      setCurrentQuota(0);
    }
  };

  const handleBaseQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) setBaseQuota(v);
    else setBaseQuota(0);
  };

  // Aggiornate per accettare stringa o Date
  const formatTime = (date: Date | string) => new Date(date).toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("it-IT", { day: 'numeric', month: 'short' });
  
  const formatDifference = (diff: number) => {
      if (diff > 0) return `Aumentata di +${diff}`;
      if (diff < 0) return `Diminuita di ${diff}`;
      return `Nessun cambiamento`;
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    
    const timestamp = new Date();
    const feedbackEntry: Feedback = {
      timestamp,
      baseQuota: baseQuota,
      quota: currentQuota,
      difference: currentQuota - initialQuota,
    };

    try {
      const result = await updateQuotas(user._id, baseQuota, currentQuota);

      if (!result) {
        // Probabilmente non autorizzato o errore lato server
        alert("Salvataggio non riuscito. Verifica di essere loggato come admin.");
        setCurrentQuota(initialQuota);
        setBaseQuota(initialBaseQuota);
        return;
      }

      // Aggiornamento ottimistico solo dopo conferma di successo
      setSaveHistory(prevHistory => {
        let updatedHistory = [feedbackEntry, ...prevHistory];
        if (updatedHistory.length > MAX_FEEDBACKS) updatedHistory = updatedHistory.slice(0, MAX_FEEDBACKS);
        return updatedHistory;
      });

    } catch (error) {
      console.error("Errore nel salvataggio della quota:", error);
      alert("Errore durante il salvataggio della quota.");
      setCurrentQuota(initialQuota);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (e: React.FormEvent) => {
    const confirmed = window.confirm(
      `Sei sicuro di voler eliminare ${user.name} ${user.surname}?`
    );
    if (!confirmed) {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col mb-3 hover:shadow-md transition duration-200">
      
      {/* 1. SEZIONE PRINCIPALE: Info Utente e Controlli */}
      <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
              
              {/* Tasto Toggle (Alto a sinistra) */}
              <button
                onClick={() => setIsHistoryVisible(prev => !prev)}
                title={isHistoryVisible ? "Nascondi storico" : "Mostra storico"}
                className="text-gray-400 hover:text-blue-600 p-1 rounded-full transition shrink-0"
              >
                {/* L'icona cambia in base allo stato */}
                {isHistoryVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              <div className="bg-blue-50 p-2 rounded-full text-blue-600 shrink-0">
                  <UserIcon size={20} />
              </div>
              
              <div>
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 leading-tight inline">{user.name} {user.surname}</h3>
                      <p className="text-xs text-gray-400">Partecipante</p>
                    </div>

                    {/* Quota display / input right next to the name */}
                    <div className="ml-2 flex items-center gap-2">
                      {isAdmin ? (
                        <input
                          type="number"
                          value={baseQuota}
                          onChange={handleBaseQuotaChange}
                          min={0}
                          disabled={isSaving}
                          title="Quota iniziale (modificabile)"
                          aria-label="Quota iniziale"
                          className="w-14 text-sm text-gray-800 text-center bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-md py-0.5 px-1 transition"
                        />
                      ) : (
                        <span className="text-sm text-gray-600 font-medium">{initialBaseQuota}</span>
                      )}

                      <span className="text-sm text-gray-400">/</span>

                      {isAdmin ? (
                        <input 
                          type="number"
                          value={currentQuota}
                          onChange={handleQuotaChange}
                          min={0}
                          disabled={isSaving}
                          title="Quota corrente (modificabile)"
                          aria-label="Quota corrente"
                          className="w-14 font-bold text-sm text-gray-800 text-center bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 rounded-md py-0.5 px-1 transition"
                        />
                      ) : (
                        <span className="text-sm text-gray-700 font-medium">{currentQuota}</span>
                      )}
                    </div>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && isDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                title="Salva modifica quota"
                className={`h-9 flex items-center justify-center px-3 rounded-lg text-sm font-medium transition ${
                  isSaving
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md active:scale-95'
                }`}
              >
                {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={16} />}
                <span className="ml-1 hidden sm:inline">{isSaving ? 'Salvataggio...' : 'Salva'}</span>
              </button>
            )}

            <form action={deleteUser} onSubmit={handleDelete}>
                <input type="hidden" name="id" value={user._id} />
                <button 
                    type="submit" 
                    title="Elimina partecipante" 
                    disabled={isSaving}
                    className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                    <Trash2 size={18} />
                </button>
            </form>
          </div>
      </div>
      
      {/* 2. STORICO FEEDBACK (Si riduce con il toggle) */}
      {saveHistory.length > 0 && isHistoryVisible && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase">
                  Storico Modifiche ({saveHistory.length}/{MAX_FEEDBACKS})
              </h4>
              
              {saveHistory.map((feedback, index) => {
                  const base = feedback.baseQuota ?? (feedback as any).newQuota ?? 0;
                  const q = feedback.quota ?? (feedback as any).newQuota ?? 0;
                  const diff = feedback.difference ?? (q - base);
                  return (
                    <div
                      key={index}
                      className={`flex items-center text-xs ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      <Clock size={14} className="mr-1.5 shrink-0" />
                      <div className="flex flex-wrap items-center gap-x-2">
                        <span className="font-medium">Modifica: {base} / {q}</span>
                        <span>il {formatDate(feedback.timestamp)} alle {formatTime(feedback.timestamp)}</span>
                      </div>
                    </div>
                  );
              })}
          </div>
      )}
    </div>
  );
}