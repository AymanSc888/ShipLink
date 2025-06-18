import React, { useState, useEffect } from "react";
import "../CompanyStyles/Payment.css";
import Sidebar from "./Sidebar";

const dummyPayments = [
  {
    id: "0001",
    customerName: "Ahmed Ali",
    amount: 150.0,
    status: "completed",
    updatedAtUtc: "2025-05-01T10:00:00Z",
  },
  {
    id: "0002",
    customerName: "Sara Mohamed",
    amount: 250.5,
    status: "pending",
    updatedAtUtc: "2025-05-10T15:30:00Z",
  },
];

const PaymentTable = ({ payments }) => {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="content">
      <h1 className="title">Payment Information</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Price</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((payment, index) => {
                const status =
                  payment.status.toLowerCase() === "completed"
                    ? "Completed"
                    : "Pending";
                return (
                  <tr key={payment.id}>
                    <td>{index + 1}</td>
                    <td>{payment.customerName}</td>
                    <td>{payment.amount.toFixed(2)} USD</td>
                    <td>
                      <span className={`status ${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                    <td>{formatDate(payment.updatedAtUtc)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedUser =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(sessionStorage.getItem("user"));

        if (!storedUser?.token) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        const res = await fetch("http://shippinganddelivery.runasp.net/api/payments", {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch payments");
        }

        const data = await res.json();
        const paymentList = data.data || [];

        if (paymentList.length === 0) {
          setPayments(dummyPayments);
        } else {
          setPayments(paymentList);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="Payment">
      <Sidebar />
      {loading ? (
        <p>Loading payments...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : (
        <PaymentTable payments={payments} />
      )}
    </div>
  );
};

export default Payment;
