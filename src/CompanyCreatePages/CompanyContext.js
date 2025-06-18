import React, { createContext, useState, useContext } from "react";

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
  const [companyData, setCompanyData] = useState({
    // Page 1
    companyName: "",
    mainLocation: "",
    email: "",
    phone: "",
    zipCode: "",
    manager: "",
    taxNumber: "",
    // Page 2
    logo: null,
    license: null,
    // Page 3
    aboutCompany: "",
    description: "",
    advantages: "",
    disadvantages: "",
    photo: null,
    // Page 4
    password: "",
    workTime: "",
  });

  return (
    <CompanyContext.Provider value={{ companyData, setCompanyData }}>
      {children}
    </CompanyContext.Provider>
  );
};
