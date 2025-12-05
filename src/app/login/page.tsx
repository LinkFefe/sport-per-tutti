import { login } from "@/app/actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full">
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">Admin Login 🔐</h1>
        
        <form action={login} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Utente</label>
            <input 
              name="username" 
              type="text" 
              className="w-full p-2 border text-gray-900 border-gray-300 rounded-lg" 
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              className="w-full p-2 border text-gray-900 border-gray-300 rounded-lg" 
              placeholder="••••••"
            />
          </div>

          <button type="submit" className="bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            Entra
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link href="/box" className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-1">
                <ArrowLeft size={16} /> Torna alla lista (sola lettura)
            </Link>
        </div>
      </div>
    </div>
  );
}