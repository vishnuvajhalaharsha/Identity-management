import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Web3 from "web3";
import VerifierDash from "./VerifierDash/index.js";
import UserDash from "./UserDash/index.js";
import ProtectedRoute from "./Routes/index";
import AuthContractABI from "./contracts/DocumentSharingContract.json";
import Login from "./Login";
import Layout from "./styles/Layout/index.js";

const AuthContractAddress = "0xfbbf58DA8Af9812392A239546Ca09C9dD9bCA5Ec"; 

const web3 = new Web3(window.ethereum);

const App = () => {
  const [userRole, setUserRole] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const roles=['None', 'User','Verifier'];

  useEffect(() => {
    async function fetchUserRole() {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const contract = new web3.eth.Contract(AuthContractABI.abi, AuthContractAddress);
      const isRegistered = await contract.methods.userRoles(accounts[0]).call();
      let index=Number(isRegistered)
      
      setUserRole(roles[index]);
      
    }

    fetchUserRole();
  }, []);

  
return (
    <div>
      
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/userdashboard"
            element={<Layout><ProtectedRoute element={UserDash} allowedRoles={['User']} userRole={userRole} /></Layout>}
          />
          <Route
            path="/verifierdashboard"
            element={<Layout><ProtectedRoute element={VerifierDash} allowedRoles={['Verifier']} userRole={userRole} /></Layout>}
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
