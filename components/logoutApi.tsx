// api/auth.ts
export const logoutAPI = async (userId: string) => {
  const response = await fetch("http://crazyholidays.in/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userid: userId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Logout failed");
  }

  return data;
};