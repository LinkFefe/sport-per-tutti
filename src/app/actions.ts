'use server'

import connectDB from "@/lib/db";
import Party from "@/models/Party";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import User from "@/models/User"; 

// --- CREA NUOVA FESTA ---
export async function createParty(formData: FormData) {
  await connectDB();

  const name = formData.get("name")?.toString() || "";
  const date = formData.get("date")?.toString() || "";
  const time = formData.get("time")?.toString() || "";
  const location = formData.get("location")?.toString() || "";

  // 👇 MODIFICA FONDAMENTALE:
  // Se il campo è vuoto (""), lo trasformiamo in undefined.
  // Così Mongoose capisce che il campo non c'è e non si arrabbia.
  const description = formData.get("description")?.toString() || undefined;
  const imageUrl = formData.get("imageUrl")?.toString() || undefined;

  const fullDate = new Date(`${date}T${time}`);

  await Party.create({
    name,
    date: fullDate,
    location,
    description, // Ora passa undefined se è vuoto
    imageUrl,    // Ora passa undefined se è vuoto
  });

  revalidatePath("/");
  redirect("/");
}

// --- AGGIORNA FESTA ESISTENTE ---
export async function updateParty(formData: FormData) {
  await connectDB();

  const id = formData.get("id");
  const name = formData.get("name");
  const date = formData.get("date");
  const time = formData.get("time");
  const location = formData.get("location");
  
  // 👇 MODIFICA FONDAMENTALE ANCHE QUI:
  const description = formData.get("description")?.toString() || undefined;
  const imageUrl = formData.get("imageUrl")?.toString() || undefined;

  const fullDate = new Date(`${date}T${time}`);

  await Party.findByIdAndUpdate(id, {
    name,
    date: fullDate,
    location,
    description,
    imageUrl,
  });

  revalidatePath("/");
  redirect("/");
}

// --- ELIMINA FESTA ---
export async function deleteParty(formData: FormData) {
  await connectDB();
  const id = formData.get("id");
  
  await Party.findByIdAndDelete(id);
  
  revalidatePath("/");
  redirect("/");
}

// --- GESTIONE UTENTI ---

// 1. Crea un nuovo utente
export async function createUser(formData: FormData) {
  await connectDB();
  
  // Convert FormData entries to strings to satisfy Mongoose/TypeScript types
  const name = formData.get("name")?.toString().trim() || "";
  const surname = formData.get("surname")?.toString().trim() || "";

  await User.create({
    name,
    surname,
    quota: 0 // Start quota at 0
  });

  revalidatePath("/box"); // Aggiorna la lista nella pagina Box
}

// 2. Modifica la quota (Aumenta/Diminuisci)
export async function updateQuota(userId: string, newQuota: number) {
  await connectDB();
  
  if (newQuota < 0) return; // Non scendiamo sotto zero

  await User.findByIdAndUpdate(userId, { quota: newQuota });
  revalidatePath("/box");
}

// 3. Elimina utente
export async function deleteUser(formData: FormData) {
  await connectDB();
  const id = formData.get("id");
  await User.findByIdAndDelete(id);
  revalidatePath("/box");
}