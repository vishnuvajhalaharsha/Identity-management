import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({
  element: Component,
  allowedRoles,
  userRole,
}) => {
  if (userRole) {
    if (allowedRoles[0] === userRole) {
      return <Component userRole={userRole} />;
    } else {
      
      return <Navigate to="/" />;
    }
  } else {
    return <>Loading...</>;
  }
};

export default ProtectedRoute;
