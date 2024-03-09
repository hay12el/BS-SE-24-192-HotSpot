import { useAuth } from "../context/AuthContext";

export const CheckAuth = () => {
  const { currentUser } = useAuth();
  return currentUser != null;
};
