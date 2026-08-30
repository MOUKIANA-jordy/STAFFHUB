import {
  useCallback,
  useEffect,
  useState,
} from "react";


const API_URL =
  process.env.REACT_APP_API_URL
  || "http://127.0.0.1:8000";


/*
=========================================================
CACHE GLOBAL DU USER

Empêche Layout, Sidebar, Header, etc.
de refaire chacun GET /api/me/
=========================================================
*/

let cachedUser = null;

let userRequest = null;


/*
=========================================================
TOKENS
=========================================================
*/

function getAccessToken() {
  return (
    localStorage.getItem("access")
    || sessionStorage.getItem("access")
    || null
  );
}


function getRefreshToken() {
  return (
    localStorage.getItem("refresh")
    || sessionStorage.getItem("refresh")
    || null
  );
}


/*
=========================================================
SAUVEGARDE NOUVEL ACCESS TOKEN
=========================================================
*/

function saveAccessToken(token) {
  if (
    localStorage.getItem("refresh")
    || localStorage.getItem("access")
  ) {
    localStorage.setItem(
      "access",
      token
    );

    return;
  }


  sessionStorage.setItem(
    "access",
    token
  );
}


/*
=========================================================
SUPPRESSION AUTH
=========================================================
*/

function clearAuthStorage() {
  localStorage.removeItem(
    "access"
  );

  localStorage.removeItem(
    "refresh"
  );

  localStorage.removeItem(
    "user"
  );

  sessionStorage.removeItem(
    "access"
  );

  sessionStorage.removeItem(
    "refresh"
  );

  sessionStorage.removeItem(
    "user"
  );

  cachedUser = null;
  userRequest = null;
}


/*
=========================================================
REFRESH TOKEN
=========================================================
*/

async function refreshAccessToken() {
  const refresh =
    getRefreshToken();


  if (!refresh) {
    throw new Error(
      "Aucun refresh token disponible."
    );
  }


  const response =
    await fetch(
      `${API_URL}/api/token/refresh/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          refresh,
        }),
      }
    );


  if (!response.ok) {
    throw new Error(
      "Le refresh token n'est plus valide."
    );
  }


  const data =
    await response.json();


  if (!data.access) {
    throw new Error(
      "Aucun nouveau token d'accès reçu."
    );
  }


  saveAccessToken(
    data.access
  );


  return data.access;
}


/*
=========================================================
GET /api/me/
=========================================================
*/

async function requestCurrentUser() {
  let access =
    getAccessToken();


  if (!access) {
    return null;
  }


  let response =
    await fetch(
      `${API_URL}/api/me/`,
      {
        headers: {
          Authorization:
            `Bearer ${access}`,
        },
      }
    );


  /*
  -------------------------------------------------------
  ACCESS EXPIRE
  -------------------------------------------------------
  */

  if (
    response.status === 401
  ) {
    try {
      access =
        await refreshAccessToken();


      response =
        await fetch(
          `${API_URL}/api/me/`,
          {
            headers: {
              Authorization:
                `Bearer ${access}`,
            },
          }
        );

    } catch (error) {
      clearAuthStorage();

      throw error;
    }
  }


  /*
  -------------------------------------------------------
  AUTRE ERREUR API
  -------------------------------------------------------
  */

  if (!response.ok) {
    throw new Error(
      `Erreur /api/me/ : ${response.status}`
    );
  }


  const userData =
    await response.json();


  cachedUser =
    userData;


  return userData;
}


/*
=========================================================
CHARGEMENT PARTAGÉ

Si plusieurs composants appellent useAuth() en même temps,
une seule requête /api/me/ sera exécutée.
=========================================================
*/

function loadCurrentUser() {
  if (cachedUser) {
    return Promise.resolve(
      cachedUser
    );
  }


  if (userRequest) {
    return userRequest;
  }


  userRequest =
    requestCurrentUser()
      .finally(() => {
        userRequest = null;
      });


  return userRequest;
}


/*
=========================================================
HOOK
=========================================================
*/

export default function useAuth() {
  const [
    user,
    setUser,
  ] = useState(
    cachedUser
  );


  const [
    loading,
    setLoading,
  ] = useState(
    !cachedUser
  );


  const [
    error,
    setError,
  ] = useState("");


  /*
  -------------------------------------------------------
  FETCH USER
  -------------------------------------------------------
  */

  const fetchUser =
    useCallback(
      async ({
        force = false,
      } = {}) => {
        setLoading(true);
        setError("");


        try {
          if (force) {
            cachedUser = null;
            userRequest = null;
          }


          const userData =
            await loadCurrentUser();


          setUser(
            userData
          );


          return userData;

        } catch (err) {
          console.error(
            "AUTH ERROR:",
            err
          );


          setUser(null);


          setError(
            "Impossible de charger l'utilisateur."
          );


          return null;

        } finally {
          setLoading(false);
        }
      },
      []
    );


  /*
  -------------------------------------------------------
  LOGOUT
  -------------------------------------------------------
  */

  const logout =
    useCallback(
      () => {
        clearAuthStorage();

        setUser(null);

        window.location.href =
          "/";
      },
      []
    );


  /*
  -------------------------------------------------------
  INITIALISATION
  -------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;


    const initialize =
      async () => {
        try {
          const userData =
            await loadCurrentUser();


          if (mounted) {
            setUser(
              userData
            );
          }

        } catch (err) {
          console.error(
            "AUTH INIT ERROR:",
            err
          );


          if (mounted) {
            setUser(null);

            setError(
              "Votre session n'est plus valide."
            );
          }

        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };


    initialize();


    return () => {
      mounted = false;
    };
  }, []);


  return {
    user,
    loading,
    error,
    fetchUser,
    logout,
  };
}
