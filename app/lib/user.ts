import { setUser } from "../store/user";

const api = process.env.EXPO_PUBLIC_API_URL!;

export type PatchUserRequest = {
  fName?: string;
  lName?: string;
  bio?: string;
  profileImg?: string;
  bannerImg?: string;
};

function cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      return (
        value !== undefined &&
        value !== null &&
        !(typeof value === "string" && value.trim() === "")
      );
    }),
  ) as Partial<T>;
}

export async function getUsers() {
  // if (api === undefined) {
  //   throw new Error("API URL is not defined");
  // }
  const res = await fetch(
    `https://probable-guacamole-alpha.vercel.app/api/user`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}

export async function getUser(id: string) {
  // if (api === undefined) {
  //   throw new Error("API URL is not defined");
  // }
  const res = await fetch(
    `https://probable-guacamole-alpha.vercel.app/api/user/${id}`,
  );
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("User not found");
    }
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

export async function postUser(request: {
  id: string;
  email: string;
  userName: string;
}) {
  try {
    console.log("Posting User");
    console.log("POST PAYLOAD:", request);

    const res = await fetch(
      "https://probable-guacamole-alpha.vercel.app/api/user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      },
    );

    const data = await res.json();

    return data;
  } catch (err) {
    console.log("POST USER ERROR:", err);
    throw err;
  }
}

export async function patchUser(
  request: PatchUserRequest,
  id: string,
  dispatch: any,
) {
  try {
    console.log("PATCH PAYLOAD:", request);
    const cleanRequest = cleanObject(request);
    const res = await fetch(
      `https://probable-guacamole-alpha.vercel.app/api/user/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanRequest),
      },
    );
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("User not found");
      }
      throw new Error("Failed to fetch user");
    }
    const data = await res.json();
    dispatch(setUser(data));

    return data;
  } catch (err) {
    console.log("PATCH USER ERROR:", err);
    throw err;
  }
}
