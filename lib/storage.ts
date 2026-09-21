import { createClient } from "@supabase/supabase-js";
export interface FileStorage { save(folder: string, name: string, data: Uint8Array): Promise<void>; read(key: string): Promise<Buffer>; remove(folder: string): Promise<void>; }
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const files = createClient(url || "https://missing.supabase.co", key || "missing", { auth: { autoRefreshToken: false, persistSession: false } }).storage.from(process.env.SUPABASE_STORAGE_BUCKET || "application-files");
export const storage: FileStorage = {
  save: async (folder, name, data) => { const { error } = await files.upload(`${folder}/${name}`, data, { upsert: false, contentType: "application/octet-stream" }); if (error) throw error; },
  read: async (key) => { const { data, error } = await files.download(key); if (error || !data) throw error || new Error("File not found"); return Buffer.from(await data.arrayBuffer()); },
  remove: async (folder) => { const { data, error } = await files.list(folder); if (error) throw error; if (data.length) { const result = await files.remove(data.map((file) => `${folder}/${file.name}`)); if (result.error) throw result.error; } },
};
