import axios from "axios";


// =========================================================
// CONFIGURATION
// =========================================================

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";


const API = axios.create({
  baseURL: BASE_URL,

  // Nécessaire pour envoyer les cookies :
  //
  // access_token
  // refresh_token
  // csrftoken
  //
  withCredentials: true,
});


// =========================================================
// CSRF
// =========================================================
//
// Le JWT reste dans un cookie HttpOnly.
// JavaScript ne peut donc pas lire access_token.
//
// Le token CSRF, lui, peut être récupéré par React.
// Il ne sert pas à authentifier l'utilisateur.
//
// Pour les requêtes sensibles, React enverra :
//
// X-CSRFToken: <token>
//
// =========================================================

let csrfToken = null;

let csrfRequest = null;


// =========================================================
// RÉCUPÉRER LE TOKEN CSRF
// =========================================================

async function fetchCsrfToken() {

  // Si nous l'avons déjà en mémoire,
  // inutile de refaire une requête.

  if (csrfToken) {
    return csrfToken;
  }


  // Évite plusieurs appels simultanés à /csrf/
  // lorsque plusieurs requêtes démarrent en même temps.

  if (csrfRequest) {
    return csrfRequest;
  }


  csrfRequest = axios
    .get(
      `${BASE_URL}/api/auth/csrf/`,
      {
        withCredentials: true,
      }
    )
    .then((response) => {

      const token =
        response.data?.csrfToken;

      if (!token) {
        throw new Error(
          "Token CSRF absent de la réponse Django."
        );
      }

      csrfToken = token;

      return token;
    })
    .finally(() => {
      csrfRequest = null;
    });


  return csrfRequest;
}


// =========================================================
// MÉTHODES HTTP SÛRES
// =========================================================

function isSafeMethod(method) {

  const safeMethods = [
    "get",
    "head",
    "options",
    "trace",
  ];

  return safeMethods.includes(
    (method || "get").toLowerCase()
  );
}


// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

API.interceptors.request.use(

  async (config) => {

    // -----------------------------------------------------
    // CSRF
    // -----------------------------------------------------
    //
    // POST
    // PUT
    // PATCH
    // DELETE
    //
    // récupèrent automatiquement un token CSRF.
    // -----------------------------------------------------

    if (!isSafeMethod(config.method)) {

      const token =
        await fetchCsrfToken();

      config.headers =
        config.headers || {};

      config.headers["X-CSRFToken"] =
        token;
    }


    // -----------------------------------------------------
    // FORM DATA
    // -----------------------------------------------------
    //
    // Pour FormData, le navigateur doit créer lui-même
    // le Content-Type avec le boundary.
    // -----------------------------------------------------

    if (config.data instanceof FormData) {

      delete config.headers[
        "Content-Type"
      ];

    } else {

      config.headers[
        "Content-Type"
      ] = "application/json";

    }


    return config;
  },

  (error) =>
    Promise.reject(error)
);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

API.interceptors.response.use(

  (response) => response,


  async (error) => {

    const originalRequest =
      error.config;


    // -----------------------------------------------------
    // ACCESS TOKEN EXPIRÉ
    // -----------------------------------------------------

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {

      const requestUrl =
        originalRequest.url || "";


      const isAuthRequest =
        requestUrl.includes(
          "/api/auth/login/"
        ) ||
        requestUrl.includes(
          "/api/auth/refresh/"
        ) ||
        requestUrl.includes(
          "/api/auth/logout/"
        ) ||
        requestUrl.includes(
          "/api/auth/csrf/"
        );


      if (isAuthRequest) {

        return Promise.reject(
          error
        );

      }


      originalRequest._retry = true;


      try {

        // -------------------------------------------------
        // CSRF POUR LE REFRESH
        // -------------------------------------------------

        const token =
          await fetchCsrfToken();


        // -------------------------------------------------
        // REFRESH TOKEN
        // -------------------------------------------------
        //
        // refresh_token reste dans le cookie HttpOnly.
        //
        // Aucun JWT n'est placé dans le body.
        // -------------------------------------------------

        await axios.post(

          `${BASE_URL}/api/auth/refresh/`,

          {},

          {
            withCredentials: true,

            headers: {

              "Content-Type":
                "application/json",

              "X-CSRFToken":
                token,
            },
          }
        );


        // -------------------------------------------------
        // FORM DATA
        // -------------------------------------------------

        if (
          originalRequest.data
          instanceof FormData
        ) {

          delete originalRequest.headers[
            "Content-Type"
          ];

        }


        // -------------------------------------------------
        // REJOUER LA REQUÊTE
        // -------------------------------------------------

        return API(
          originalRequest
        );

      } catch (refreshError) {

        clearAuthentication();


        if (
          window.location.pathname
          !== "/"
        ) {

          window.location.href =
            "/";

        }


        return Promise.reject(
          refreshError
        );
      }
    }


    return Promise.reject(
      error
    );
  }
);


// =========================================================
// CLEAR AUTH
// =========================================================

function clearAuthentication() {

  // Les JWT HttpOnly ne peuvent pas être supprimés
  // directement avec JavaScript.
  //
  // Django les supprime via :
  //
  // POST /api/auth/logout/


  // Nettoyage des anciennes données de StaffHub.

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


  // Le token CSRF conservé en mémoire
  // n'est plus nécessaire après déconnexion.

  csrfToken = null;
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
