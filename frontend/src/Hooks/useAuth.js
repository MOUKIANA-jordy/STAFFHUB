import {
  useCallback,
  useEffect,
  useState,
} from "react";

import API from "../Services/api";


// =========================================================
// CACHE GLOBAL DU USER
// =========================================================
//
// Empêche Layout, Sidebar, Header, etc.
// de refaire chacun GET /api/me/.
//
// Les JWT ne sont PLUS stockés ici.
// Ils sont maintenant dans des cookies HttpOnly.
// =========================================================

let cachedUser = null;
let userRequest = null;


// =========================================================
// NETTOYAGE ANCIEN STOCKAGE
// =========================================================
//
// Ces suppressions servent uniquement à nettoyer les anciens
// JWT qui pourraient encore être présents dans le navigateur.
//
// Aucun nouveau JWT n'est enregistré dans localStorage ou
// sessionStorage.
// =========================================================

function clearOldAuthStorage() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");

  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  sessionStorage.removeItem("user");
}


// =========================================================
// RESET CACHE USER
// =========================================================

function clearUserCache() {
  cachedUser = null;
  userRequest = null;
}


// =========================================================
// GET /api/me/
// =========================================================
//
// API utilise déjà :
//
// withCredentials: true
//
// Le navigateur envoie donc automatiquement :
//
// access_token=<JWT>
//
// dans le cookie HttpOnly.
//
// Si l'access token est expiré, l'interceptor de api.js
// appellera /api/auth/refresh/ automatiquement.
// =========================================================

async function requestCurrentUser() {
  try {
    const response = await API.get(
      "/api/me/"
    );

    const userData = response.data;

    cachedUser = userData;

    return userData;
  } catch (error) {
    // 401 = aucune session valide
    if (error.response?.status === 401) {
      clearUserCache();
      return null;
    }

    throw error;
  }
}


// =========================================================
// CHARGEMENT PARTAGÉ
// =========================================================
//
// Si plusieurs composants utilisent useAuth() en même temps,
// une seule requête GET /api/me/ sera exécutée.
// =========================================================

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


// =========================================================
// HOOK
// =========================================================

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


  // =======================================================
  // FETCH USER
  // =======================================================

  const fetchUser =
    useCallback(
      async ({
        force = false,
      } = {}) => {
        setLoading(true);
        setError("");

        try {
          if (force) {
            clearUserCache();
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


  // =======================================================
  // LOGOUT
  // =======================================================
  //
  // IMPORTANT :
  //
  // Les cookies sont HttpOnly.
  // JavaScript ne peut donc pas les supprimer directement.
  //
  // On demande au backend Django de :
  //
  // 1. blacklister le refresh token
  // 2. supprimer access_token
  // 3. supprimer refresh_token
  // =======================================================

  const logout =
    useCallback(
      async () => {
        try {
          await API.post(
            "/api/auth/logout/",
            {}
          );
        } catch (err) {
          console.error(
            "LOGOUT ERROR:",
            err
          );
        } finally {
          clearUserCache();

          clearOldAuthStorage();

          setUser(null);

          window.location.href = "/";
        }
      },
      []
    );


  // =======================================================
  // INITIALISATION
  // =======================================================

  useEffect(() => {
    let mounted = true;

    // Nettoyage des JWT laissés par l'ancienne version
    // de StaffHub.
    clearOldAuthStorage();

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


  // =======================================================
  // RETURN
  // =======================================================

  return {
    user,
    loading,
    error,
    fetchUser,
    logout,
  };
}
