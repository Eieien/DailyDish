export async function getUsers() {
  const res = await fetch("/api/users");

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}

export async function getUser(id: string)  {
  // const res = await fetch(`/api/users/${id}`);
  const res = await fetch("/api/users");

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const users = await res.json();
  const user = users.find((u: { id: string }) => u.id === id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function postUsers(request: {
  id: string;
  name: string;
}) {
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
  return res.json();
}
