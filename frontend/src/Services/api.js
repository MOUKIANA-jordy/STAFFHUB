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

let csrfToken = null;
let csrfRequest = null;


// =========================================================
// REFRESH JWT
// =========================================================
//
// Une seule requête de refresh peut être exécutée
// à la fois.
//
// Si plusieurs appels API reçoivent 401 simultanément,
// ils attendent tous la même Promise.
//
// Cela évite que plusieurs refresh utilisent le même
// refresh_token alors que Django effectue sa rotation.
// =========================================================

let refreshRequest = null;


// =========================================================
// RÉCUPÉRER LE TOKEN CSRF
// =========================================================

async function fetchCsrfToken() {

  if (csrfToken) {
    return csrfToken;
  }


  // Évite plusieurs appels simultanés à /csrf/

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
    // POST / PUT / PATCH / DELETE
    // reçoivent automatiquement X-CSRFToken.
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
// EFFECTUER LE REFRESH
// =========================================================

async function refreshAccessToken() {

  // Si un refresh est déjà en cours,
  // toutes les autres requêtes attendent celui-ci.

  if (refreshRequest) {
    return refreshRequest;
  }


  refreshRequest = (async () => {

    // Récupération du CSRF déjà chargé
    // ou récupération d'un nouveau si nécessaire.

    const token =
      await fetchCsrfToken();


    // Le refresh_token est envoyé automatiquement
    // par le navigateur grâce au cookie HttpOnly.

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

  })();


  try {

    await refreshRequest;

  } finally {

    // Important :
    // le prochain renouvellement pourra créer
    // une nouvelle requête de refresh.

    refreshRequest = null;
  }
}


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


      // Ces endpoints ne doivent jamais provoquer
      // eux-mêmes un nouveau refresh.

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
        // UN SEUL REFRESH POUR TOUS LES 401
        // -------------------------------------------------

        await refreshAccessToken();


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
        // REJOUER LA REQUÊTE INITIALE
        // -------------------------------------------------
        //
        // Le navigateur possède maintenant le nouveau
        // access_token HttpOnly.
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


  // Nettoyage des anciennes données StaffHub.

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


  // Nettoyage de l'état CSRF en mémoire.

  csrfToken = null;
  csrfRequest = null;

  // On oublie également un éventuel refresh.
  refreshRequest = null;
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
