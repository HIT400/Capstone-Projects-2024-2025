import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../public/Header";
import Footer from "../public/Footer";
import Cookies from "js-cookie";

const ErrorPage = ({ code, message, illustration }) => {
  const navigate = useNavigate();

  const role = Cookies.get("p_ur");

  const getHomeRoute = () => {
    switch (role) {
      case "supplier":
        return "/suppliers";
      case "procuring_entity":
        return "/procurers";
      default:
        return "/public";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-auto text-center">
          <div className="px-6 py-8">
            <h2 className="font-medium text-lg text-gray-700">{code}</h2>
          </div>
          <div className="p-6 py-10 space-y-4">
            <div className="w-full flex justify-center py-4">
              <img
                src={illustration}
                alt={`${code} error illustration`}
                className="w-48 h-48 object-contain"
              />
            </div>
            <h3 className="text-xl font-normal py-4 text-gray-600">
              {message}
            </h3>
            <div>
              <button
                onClick={() => navigate(getHomeRoute())}
                className=" bg-primary text-white px-4 py-4 rounded hover:bg-primary/90 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export const NotFoundPage = () => (
  <ErrorPage
    code="404"
    message="Sorry, the page you are looking for doesn't exist."
    illustration="/6859464.jpg"
  />
);

export const ForbiddenPage = () => (
  <ErrorPage
    code="403"
    message="You do not have permission to access this page."
    illustration="/6859464.png"
  />
);

export const UnauthorizedPage = () => (
  <ErrorPage
    code="401"
    message="You are not authorized to view this page."
    illustration="/6859464.png"
  />
);

export default ErrorPage;
