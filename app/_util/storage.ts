// // import { supabase } from "./supabase";

// type UploadImageProps = {
//   imageUri: string;
//   bucket: string;
//   path: string;
// };

// export const uploadImage = async ({
//   imageUri,
//   bucket,
//   path,
// }: UploadImageProps) => {
//   try {
//     const formData = new FormData();

//     formData.append("file", {
//       uri: imageUri,
//       name: "upload.jpg",
//       type: "image/jpeg",
//     } as any);

//     const { data, error } = await supabase.storage
//       .from(bucket)
//       .upload(path, formData as any, {
//         contentType: "image/jpeg",
//         upsert: true,
//       });

//     if (error) throw error;

//     const { data: publicUrl } = supabase.storage
//       .from(bucket)
//       .getPublicUrl(path);

//     return publicUrl.publicUrl;
//   } catch (err) {
//     console.log("UPLOAD ERROR:", err);
//     return null;
//   }
// };
