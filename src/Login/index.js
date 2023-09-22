import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Web3 from "web3";
import AuthContractABI from "../contracts/DocumentSharingContract.json";
import  Register  from "./Register";
import LoginMetamask from "./Login"

const AuthContractAddress ="0x95c1785866b2AAea8EaF9697a6f9bF16B8113DD4"; 

const web3 = new Web3(window.ethereum);

const Login = () => {
  const [userRole, setUserRole] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [email, setEmail]=useState("")
  

  const navigate = useNavigate();
  

  
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        const contract = new web3.eth.Contract(
          AuthContractABI.abi,
          AuthContractAddress
        );
       
        const isRegistered = await contract.methods
          .userRoles(accounts[0])
          .call();
         
        setIsRegistered(Number(isRegistered) > 0);
       
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
   
    checkRegistration();
   
  }, []);

  const handleRegister = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const contract = new web3.eth.Contract(
        AuthContractABI.abi,
        AuthContractAddress
      );
      const isRegistered = await contract.methods
        .userRoles(accounts[0])
        .call();
       
      
      if (Number(isRegistered) > 0) {
        console.error("User is already registered.");
        return;
      }

      const roleValue = ["None", "User", "Verifier"].indexOf(userRole);
     
      if (roleValue <= 0) {
        console.error("Invalid role selection");
        return;
      }

      await contract.methods.registerUser(roleValue, email).send({
        from: accounts[0],
      });

      setIsRegistered(true);
    } catch (error) {
      console.error("Registration failed:", error.message);
    }
  };

  const handleLoginWithMetamask = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const contract = new web3.eth.Contract(
        AuthContractABI.abi,
        AuthContractAddress
      );
      const isRegistered = await contract.methods
        .userRoles(accounts[0])
        .call();


      if (Number(isRegistered) === 0) {
        console.error("User is not registered.");
        return;
      }

      // Based on the user role, redirect them to the appropriate dashboard
      if (Number(isRegistered) === 1) {
        navigate("/userdashboard");
      } else if (Number(isRegistered) === 2) {
        navigate("/verifierdashboard");
      } else {
        console.error("Invalid role selection");
      }
    } catch (error) {
      console.error("Login failed:", error.message);
    }
  };

  const handleRoleChange = (event) => {
    setUserRole(event.target.value);
  };

 const handleEmail=(e)=>{
    setEmail(e.target.value)
 }  

  return (
    <div>
    
      {isRegistered ? (
        <>
        
        <LoginMetamask handleLoginWithMetamask={handleLoginWithMetamask}/>
         
        </>
      ) : (
        <Register userRole={userRole} handleRoleChange={handleRoleChange} handleEmail={handleEmail} handleRegister={handleRegister}/>
      )}
    </div>
  );
};

export default Login;
