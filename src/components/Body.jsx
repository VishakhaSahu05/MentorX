import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatDock from "./ChatDock";
import axios from "axios";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../utils/userSlice";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const isChatRoute = /^\/chat\//.test(location.pathname);

  const fetchUser = async () => {
    if (userData) return;

    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(removeUser());
        navigate("/");
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div
      className={
        isChatRoute
          ? "flex flex-col bg-[#eefaf5] overflow-x-hidden h-dvh sm:min-h-screen sm:h-auto"
          : "min-h-screen flex flex-col bg-[#eefaf5] overflow-x-hidden"
      }
    >
      <div className={isChatRoute ? "hidden sm:block" : undefined}>
        <Navbar />
      </div>
      <main className={isChatRoute ? "grow w-full min-h-0" : "grow w-full"}>
        <Outlet />
      </main>
      <div className={isChatRoute ? "hidden sm:block" : undefined}>
        <Footer />
      </div>
      <ChatDock />
    </div>
  );
};

export default Body;
