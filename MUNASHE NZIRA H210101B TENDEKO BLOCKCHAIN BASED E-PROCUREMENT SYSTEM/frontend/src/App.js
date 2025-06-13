import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PublicTenders from "./pages/public/Tenders.jsx";
import PublicTenderPage from "./pages/public/TenderPage.jsx";
import MainContent from "./pages/public/MainPage.jsx";
import Middleware from "./utils/Middleware.jsx";
import TenderRegistrationForm from "./pages/procurer/TenderCreate.jsx";
import AuthPage from "./pages/public/Auth.jsx";
import {
  NotFoundPage,
  ForbiddenPage,
  UnauthorizedPage,
} from "./components/errors/ErrorPage.jsx";
import {
  ProcurerProfilePage,
  ProcurerSettingsPage,
} from "./pages/procurer/Settings.jsx";
import {
  SupplierSettingsPage,
  SupplierProfilePage,
} from "./pages/supplier/Settings.jsx";
import SupplierTenderPage from "./pages/supplier/TenderPage.jsx";
import ProcurerTenderPage from "./pages/procurer/TenderPage.jsx";
import ProductCreationPage from "./pages/TestPage.jsx";
import ProcurerMainContent from "./pages/procurer/MainPage.jsx";
import ProcurerContractPage from "./pages/procurer/ContractPage.jsx";
import NotificationsPage from "./pages/procurer/NotificationsPage.jsx";
import SupplierMainContent from "./pages/supplier/MainPage.jsx";
import PublicContractPage from "./pages/public/ContractPage.jsx";
import SupplierContractPage from "./pages/supplier/ContractPage.jsx";
import RegulatorDashboard from "./pages/regulator/Main.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<AuthPage />}></Route>
        <Route
          path="/auth/register"
          element={<AuthPage isRegistering={true} />}
        ></Route>

        <Route path="/public/tenders" element={<PublicTenders />} />
        <Route
          path="/public/tenders/:subcategory_id"
          element={<PublicTenders />}
        />

        <Route path="/public" element={<MainContent />} />
        <Route path="/public/contract/:id" element={<PublicContractPage />} />
        <Route path="/public/tender/:id" element={<PublicTenderPage />} />

        {/* Procurer protected routes */}
        <Route element={<Middleware allowedRole="procuring_entity" />}>
          <Route path="/procurers" element={<ProcurerMainContent />} />
          <Route
            path="/procurers/tender/:id"
            element={<ProcurerTenderPage />}
          />

          <Route
            path="/procurers/contract/:id"
            element={<ProcurerContractPage />}
          />
          <Route
            path="/procurers/create/tender"
            element={<TenderRegistrationForm />}
          />
          <Route
            path="/procurers/settings"
            element={<ProcurerSettingsPage />}
          />

          <Route
            path="/procurers/tenders/:subcategory_id"
            element={<PublicTenders user_type={"procurer"} />}
          />

          <Route
            path="/procurers/notifications"
            element={<NotificationsPage user_type={"procurer"} />}
          />

          <Route path="/procurers/profile" element={<ProcurerProfilePage />} />
        </Route>

        {/* Suppliers Routes */}
        <Route element={<Middleware allowedRole="supplier" />}>
          <Route path="/suppliers" element={<SupplierMainContent />} />
          <Route
            path="/suppliers/tender/:id"
            element={<SupplierTenderPage />}
          />

          <Route
            path="/suppliers/tenders"
            element={<PublicTenders user_type={"supplier"} />}
          />

          <Route
            path="/suppliers/contract/:id"
            element={<SupplierContractPage />}
          />

          <Route
            path="/suppliers/tenders/:subcategory_id"
            element={<PublicTenders user_type={"supplier"} />}
          />
          <Route
            path="/suppliers/settings"
            element={<SupplierSettingsPage />}
          />
          <Route path="/suppliers/profiles" element={<SupplierProfilePage />} />
        </Route>

        <Route path="/regulators" element={<RegulatorDashboard />} />

        {/* Test Route */}
        <Route path="/test" element={<ProductCreationPage />} />
        {/* Error Routes */}
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/401" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  );
}

export default App;
