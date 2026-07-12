import { randomUUID } from "node:crypto";

import { supabaseAdmin } from "../../db/supabaseAdmin";

const BUCKET = "recipe-images";
const ALLOWED_FOLDERS = ["recipes", "meals", "avatars"];

export async function POST(request: Request) {
  // React Native's own FormData type (append/getAll/getParts only) shadows
  // the DOM one's .get() at the ambient-type level, even though this route
  // only ever runs server-side against the real Fetch API implementation.
  const formData = (await request.formData()) as any;
  const file = formData.get("file");
  const folderInput = formData.get("folder");
  const folder = ALLOWED_FOLDERS.includes(String(folderInput)) ? String(folderInput) : "misc";

  if (!(file instanceof Blob)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const ext = file.type?.split("/")[1]?.split("+")[0] || "jpg";
  const path = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type || "image/jpeg", upsert: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return Response.json({ url: data.publicUrl });
}
