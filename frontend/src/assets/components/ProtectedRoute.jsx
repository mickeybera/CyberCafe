import {
  Navigate,
  Outlet,
} from "react-router-dom";

// import {
//   useAuth,
// } from "../context/AuthContext";
import { useAuth } from "../../context/AuthContext";


const ProtectedRoute = () => {

  const {
    user,
  } = useAuth();


  if (!user) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );

  }


  return <Outlet />;

};


export default ProtectedRoute;