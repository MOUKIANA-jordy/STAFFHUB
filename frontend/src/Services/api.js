import axios from "axios";


const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL
    || "http://localhost:8000",
});


// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access")
      || sessionStorage.getItem("access");


    // -------------------------------------------------------
    // TOKEN
    // -------------------------------------------------------

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }


    // -------------------------------------------------------
    // FORM DATA
    // -------------------------------------------------------
    //
    // IMPORTANT :
    // Ne jamais forcer application/json pour FormData.
    //
    // Le navigateur doit générer lui-même :
    //
    // multipart/form-data;
    // boundary=----------------...
    //
    // Sinon Django retourne 415.
    // -------------------------------------------------------

    if (
      config.data
      instanceof FormData
    ) {
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
  (response) =>
    response,


  async (error) => {
    const originalRequest =
      error.config;


    // -------------------------------------------------------
    // TOKEN EXPIRE
    // -------------------------------------------------------

    if (
      error.response?.status
        === 401
      &&
      originalRequest
      &&
      !originalRequest._retry
    ) {
      originalRequest._retry =
        true;


      const refresh =
        localStorage.getItem(
          "refresh"
        )
        ||
        sessionStorage.getItem(
          "refresh"
        );


      if (!refresh) {
        clearAuthentication();

        window.location.href =
          "/";

        return Promise.reject(
          error
        );
      }


      try {
        const response =
          await axios.post(
            `${API.defaults.baseURL}/api/token/refresh/`,
            {
              refresh,
            },
            {
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );


        const newAccess =
          response.data.access;


        // ---------------------------------------------------
        // GARDE LE MEME TYPE DE STOCKAGE
        // ---------------------------------------------------

        if (
          localStorage.getItem(
            "refresh"
          )
        ) {
          localStorage.setItem(
            "access",
            newAccess
          );
        } else {
          sessionStorage.setItem(
            "access",
            newAccess
          );
        }


        // ---------------------------------------------------
        // NOUVEAU TOKEN
        // ---------------------------------------------------

        originalRequest.headers.Authorization =
          `Bearer ${newAccess}`;


        // ---------------------------------------------------
        // IMPORTANT POUR FORM DATA
        // ---------------------------------------------------

        if (
          originalRequest.data
          instanceof FormData
        ) {
          delete originalRequest
            .headers[
              "Content-Type"
            ];
        }


        return API(
          originalRequest
        );

      } catch (
        refreshError
      ) {
        clearAuthentication();

        window.location.href =
          "/";

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
}


export default API;
