import connectDB from "@/lib/db";
import User from "@/models/User";
import { createUser } from "@/app/actions";
import UserItem from "@/objects/UserItem";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

// 1. Definizione tipo
export interface UserProps {
  _id: string;
  name: string;
  surname: string;
  quota: number;
}

// 2. Fetch utenti
async function getUsers(): Promise<UserProps[]> {
  await connectDB();

  const users = await User.find().sort({ name: 1 }).lean();

  return users.map((doc: any) => ({
    _id: doc._id.toString(),
    name: doc.name,
    surname: doc.surname,
    quota: doc.quota || 0,
  }));
}

export default async function BoxPage() {
  const users = await getUsers();

  // 🔐 Controllo cookie come fai nella homepage
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "true";

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20">
      <div className="max-w-md mx-auto">

        {/* Intestazione */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 transition">
            <ArrowLeft size={20} className="mr-2" /> Torna alla Home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Boxs 👥</h1>
        </div>

        {/* --- FORM AGGIUNTA NUOVO UTENTE (Solo admin) --- */}
        {isAdmin && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Aggiungi Nuovo Partecipante
            </h2>

            <form action={createUser} className="flex gap-2 items-end">
              <div className="w-1/3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Nome
                </label>
                <input 
                  name="name"
                  type="text"
                  required
                  placeholder="Nome"
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Cognome
                </label>
                <input 
                  name="surname"
                  type="text"
                  required
                  placeholder="Cognome"
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                title="Aggiungi partecipante"
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition h-[38px] w-[38px] flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </form>
          </div>
        )}

        {/* --- LISTA UTENTI --- */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            Elenco ({users.length})
          </h2>

          {users.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Nessun partecipante inserito.
            </div>
          ) : (
            users.map((user) => (
              <UserItem
                key={user._id}
                user={user}
                isAdmin={isAdmin} // ⬅️ NUOVA PROP PASSATA QUI
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
