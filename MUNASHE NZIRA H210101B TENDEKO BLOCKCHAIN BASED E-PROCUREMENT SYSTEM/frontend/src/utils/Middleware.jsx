// import React, { useEffect, useState } from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import Cookies from "js-cookie";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";

// const Middleware = ({ allowedRole }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     const validateSession = async () => {
//       const accessToken = Cookies.get("p_at");
//       const storedRole = Cookies.get("p_ur");

//       if (!accessToken || !storedRole) {
//         setIsAuthenticated(false);
//         setIsLoading(false);
//         return;
//       }

//       try {
//         const decodedToken = jwtDecode(accessToken);
//         const currentTime = Math.floor(Date.now() / 1000);

//         if (decodedToken.exp < currentTime) {
//           try {
//             await axios.post(
//               "http://localhost:8000/auth/refresh",
//               {},
//               {
//                 withCredentials: true,
//               }
//             );
//             setIsAuthenticated(true);
//           } catch (error) {
//             Cookies.remove("p_at");
//             Cookies.remove("p_rt");
//             Cookies.remove("p_ur");
//             setIsAuthenticated(false);
//           }
//         } else {
//           setIsAuthenticated(true);
//         }
//       } catch (error) {
//         console.error("Invalid token:", error);
//         setIsAuthenticated(false);
//       }

//       setIsLoading(false);
//     };

//     validateSession();
//   }, []);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/public" replace />;
//   }

//   const storedRole = Cookies.get("p_ur");
//   const isAuthorized = allowedRole === storedRole;

//   return isAuthorized ? <Outlet /> : <Navigate to="/public" replace />;
// };

// axios.defaults.withCredentials = true;

// axios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         await axios.post(
//           "http://localhost:8000/auth/refresh",
//           {},
//           {
//             withCredentials: true,
//           }
//         );

//         return axios(originalRequest);
//       } catch (refreshError) {
//         Cookies.remove("p_at");
//         Cookies.remove("p_rt");
//         Cookies.remove("p_ur");
//         window.location.href = "/public";
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default Middleware;

import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Middleware = ({ allowedRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const accessToken = Cookies.get("p_at");
      const storedRole = Cookies.get("p_ur");

      if (!accessToken || !storedRole) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);

        if (decodedToken.exp < currentTime) {
          try {
            await axios.post(
              "http://localhost:8000/auth/refresh",
              {},
              {
                withCredentials: true,
              }
            );
            setIsAuthenticated(true);
          } catch (error) {
            Cookies.remove("p_at");
            Cookies.remove("p_rt");
            Cookies.remove("p_ur");
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    validateSession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/public" replace />;
  }

  const storedRole = Cookies.get("p_ur");

  if (storedRole === "regulator") {
    return <Navigate to="/regulators" replace />;
  }

  const isAuthorized = allowedRole === storedRole;
  return isAuthorized ? <Outlet /> : <Navigate to="/public" replace />;
};

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          "http://localhost:8000/auth/refresh",
          {},
          {
            withCredentials: true,
          }
        );

        return axios(originalRequest);
      } catch (refreshError) {
        Cookies.remove("p_at");
        Cookies.remove("p_rt");
        Cookies.remove("p_ur");
        window.location.href = "/public";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default Middleware;
