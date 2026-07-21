import { apiUrl } from "./apiClient";

export type UploadFolder = "recipes" | "meals" | "avatars" | "chat";

export async function uploadImage(uri: string, folder: UploadFolder): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  const ext = blob.type?.split("/")[1]?.split("+")[0] || "jpg";

  const formData = new FormData();
  formData.append("file", blob, `photo.${ext}`);
  formData.append("folder", folder);

  const res = await fetch(apiUrl("/api/upload"), {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await res.json();
  return data.url;
}
