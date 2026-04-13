import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    let access =
      localStorage.getItem("access") ||
      sessionStorage.getItem("access");

    let refresh =
      localStorage.getItem("refresh") ||
      sessionStorage.getItem("refresh");

    console.log("ACCESS:", access);
    console.log("REFRESH:", refresh);

    if (!access) {
      console.log("❌ Pas de token");
      return;
    }

    let res = await fetch("http://127.0.0.1:8000/api/me/", {
      headers: {
        Authorization: `Bearer ${access}`,
      },
    });

    // 🔥 refresh si expiré
    if (res.status === 401 && refresh) {
      console.log("🔄 Access expiré → refresh...");

      const refreshRes = await fetch(
        "http://127.0.0.1:8000/api/token/refresh/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh }),
        }
      );

      const data = await refreshRes.json();

      if (data.access) {
        localStorage.setItem("access", data.access);

        res = await fetch("http://127.0.0.1:8000/api/me/", {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        });
      } else {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
        return;
      }
    }

    const userData = await res.json();
    console.log("USER DATA:", userData);

    setUser(userData);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user };
}
