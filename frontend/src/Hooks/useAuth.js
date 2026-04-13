import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    let access = localStorage.getItem("access");
    let refresh = localStorage.getItem("refresh");

    if (!access) return;

    let res = await fetch("http://127.0.0.1:8000/api/me/", {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    // 🔥 si token expiré
    if (res.status === 401) {
      console.log("Access expiré → refresh...");

      const refreshRes = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });

      const data = await refreshRes.json();

      if (data.access) {
        localStorage.setItem("access", data.access);

        // retry
        res = await fetch("http://127.0.0.1:8000/api/me/", {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        });
      } else {
        localStorage.clear();
        window.location.href = "/";
        return;
      }
    }

    const userData = await res.json();
    console.log("USER:", userData);
    setUser(userData);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user };
}
