import axios from "axios";

// =========================================================
// CONFIGURATION API
// =========================================================

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000",

  // IMPORTANT :
  // Permet au navigateur d'envoyer les cookies HttpOnly
  // vers le backend Django.
  withCredentials: true,
});


// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

API.interceptors.request.use(
  (config) => {
    // -----------------------------------------------------
    // PLUS DE JWT DANS LOCALSTORAGE
    // -----------------------------------------------------
    //
    // Avant :
    //
    // Authorization: Bearer <token>
    //
    // Maintenant :
    //
    // Le navigateur envoie automatiquement le cookie
    // access_token grâce à withCredentials: true.
    //
    // JavaScript ne peut pas lire le cookie car il est
    // HttpOnly.
    // -----------------------------------------------------


    // -----------------------------------------------------
    // FORM DATA
    // -----------------------------------------------------
    //
    // Ne jamais forcer application/json pour FormData.
    //
    // Le navigateur doit générer lui-même :
    //
    // multipart/form-data;
    // boundary=----------------...
    //
    // Sinon Django peut retourner 415.
    // -----------------------------------------------------

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },

  (error) => Promise.reject(error)
);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // -----------------------------------------------------
    // ACCESS TOKEN EXPIRÉ
    // -----------------------------------------------------
    //
    // Si Django retourne 401 :
    //
    // 1. Le navigateur possède normalement refresh_token
    //    dans un cookie HttpOnly.
    //
    // 2. On appelle /api/auth/refresh/
    //
    // 3. Django crée un nouveau access_token.
    //
    // 4. Django remplace automatiquement les cookies.
    //
    // 5. On rejoue la requête d'origine.
    // -----------------------------------------------------

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Ne pas essayer de refresh si c'est justement
      // le login ou le refresh qui a échoué.
      const requestUrl =
        originalRequest.url || "";

      const isAuthRequest =
        requestUrl.includes("/api/auth/login/") ||
        requestUrl.includes("/api/auth/refresh/") ||
        requestUrl.includes("/api/auth/logout/");

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // -------------------------------------------------
        // REFRESH TOKEN
        // -------------------------------------------------
        //
        // Aucun refresh token dans le body.
        //
        // Le navigateur envoie automatiquement :
        //
        // Cookie: refresh_token=...
        //
        // grâce à withCredentials.
        // -------------------------------------------------

        await axios.post(
          `${API.defaults.baseURL}/api/auth/refresh/`,
          {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );


        // -------------------------------------------------
        // FORM DATA
        // -------------------------------------------------

        if (
          originalRequest.data instanceof FormData
        ) {
          delete originalRequest.headers[
            "Content-Type"
          ];
        }


        // -------------------------------------------------
        // REJOUER LA REQUÊTE
        // -------------------------------------------------
        //
        // Le nouveau access_token est maintenant
        // dans le cookie HttpOnly.
        // -------------------------------------------------

        return API(originalRequest);

      } catch (refreshError) {
        // Le refresh token est lui aussi invalide
        // ou expiré.
        //
        // L'utilisateur doit se reconnecter.

        clearAuthentication();

        if (
          window.location.pathname !== "/"
        ) {
          window.location.href = "/";
        }

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);


// =========================================================
// CLEAR AUTH
// =========================================================

function clearAuthentication() {
  // -------------------------------------------------------
  // JWT
  // -------------------------------------------------------
  //
  // On ne peut PAS supprimer access_token ou refresh_token
  // ici avec JavaScript car ils sont HttpOnly.
  //
  // C'est Django qui doit les supprimer via :
  //
  // POST /api/auth/logout/
  // -------------------------------------------------------


  // On nettoie uniquement d'anciennes données qui peuvent
  // encore exister à cause de l'ancien système.

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");

  sessionStorage.removeItem("access");
  sessionStorage.removeItem("refresh");
  sessionStorage.removeItem("user");
}


// =========================================================
// LOGOUT
// =========================================================

export async function logout() {
  try {
    await API.post(
      "/api/auth/logout/",
      {}
    );
  } catch (error) {
    console.error(
      "Erreur lors de la déconnexion :",
      error
    );
  } finally {
    clearAuthentication();
  }
}


export default API;
