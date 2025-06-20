import { Navigate } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./LoginPage/Login";
import ForgetPassword from "./LoginPage/ForgetPassword";
import VerifyOTP from "./LoginPage/VerifyOTP";
import ResetPassword from "./LoginPage/ResetPassword";
import DashboardCompany from "./CompanyPages/DashboardCompany";
import NewOrders from "./CompanyPages/NewOrders";
import CreateOffer from "./CompanyPages/CreateOffer";
import OffersSent from "./CompanyPages/OffersSent";
import InProgressOrders from "./CompanyPages/InProgressOrders";
import CompletedOrders from "./CompanyPages/CompletedOrders";
import First from "./CompanyCreatePages/First";
import Second from "./CompanyCreatePages/Second";
import Fourth from "./CompanyCreatePages/Fourth";
import Fifth from "./CompanyCreatePages/Fifth";
import DashboardAdmin from "./AdminPages/DashboardAdmin";
import Companies from "./AdminPages/Companies";
import Complaints from "./AdminPages/Complaints";
import Chat from "./AdminPages/Chat";
import ChatCompany from "./CompanyPages/ChatCompany";
import Payment from "./CompanyPages/Payment";
import Settings from "./CompanyPages/Settings";
import { CompanyProvider } from "./CompanyCreatePages/CompanyContext";

function App() {
  return (
    <BrowserRouter basename="/ShipLink">
      <Routes>
        <Route path="/ShipLink" element={<Navigate to="/" />} />
  <Route path="/" element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard-company" element={<DashboardCompany />} />
        <Route path="/new-orders" element={<NewOrders />} />
        <Route path="/create-offer/:orderId" element={<CreateOffer />} />
        <Route path="/offers-sent" element={<OffersSent />} />
        <Route path="/in-progress-orders" element={<InProgressOrders />} />
        <Route path="/completed" element={<CompletedOrders />} />
        <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/chat-admin" element={<Chat />} />
        <Route path="/chat-company" element={<ChatCompany />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/settings" element={<Settings />} />

        <Route
          path="/first"
          element={
            <CompanyProvider>
              <First />
            </CompanyProvider>
          }
        />
        <Route
          path="/second"
          element={
            <CompanyProvider>
              <Second />
            </CompanyProvider>
          }
        />
        <Route
          path="/fourth"
          element={
            <CompanyProvider>
              <Fourth />
            </CompanyProvider>
          }
        />
        <Route
          path="/fifth"
          element={
            <CompanyProvider>
              <Fifth />
            </CompanyProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;