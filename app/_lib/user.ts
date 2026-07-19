export type Units = "metric" | "imperial";

export type UserProfile = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  dietGoal: string | null;
  dailyCalorieTarget: number | null;
  units: Units;
  remindersEnabled: boolean;
  avatarUrl: string | null;
};

export async function getUsers(): Promise<UserProfile[]> {
  const res = await fetch("/api/users");

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}

export async function getUser(id: string): Promise<UserProfile | null> {
  const res = await fetch(`/api/users/${id}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
}

export async function postUsers(request: { id: string; name: string }): Promise<UserProfile> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error("Failed to create user");
  }

  const data = await res.json();
  return data.user;
}

export async function updateUser(
  id: string,
  patch: Partial<
    Pick<
      UserProfile,
      | "name"
      | "dietGoal"
      | "dailyCalorieTarget"
      | "isActive"
      | "units"
      | "remindersEnabled"
      | "avatarUrl"
    >
  >
): Promise<UserProfile> {
  const res = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    throw new Error("Failed to update user");
  }

  return res.json();
}
