import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { removeUser, setUser } from "../redux/slices/userSlices";
import { useNavigate } from "react-router-dom";
import { getApiData } from "../api/auth.api";

const useLoadData = () => {
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getApiData();
        console.log(data);
        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
      } catch (error) {
        dispatch(removeUser());
        navigate("/auth");
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [dispatch, navigate]);

  return isLoading;
};

export default useLoadData;
