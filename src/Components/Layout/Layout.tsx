import { useEffect } from "react";
import MenuBar from "../MenuBar/MenuBar";
import { Box, Container } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { apiGet } from "../../utils/apiUtils";
import {
  UserDataType,
  useUserData,
} from "../../Context/UserContext/UserContext";
import Footer from "../Footer/Footer";
import { Flex } from "antd";
import CookieBanner from "../CookieBanner/CookieBanner";

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { updateUser: updateUserData, userData, signOut } = useUserData();
  const isSignedIn = userData.isAuthenticated;
  const location = useLocation();
  const navigate = useNavigate();

  const getUserData = async (username: string) => {
    try {
      const data = await apiGet<UserDataType>(
        `/api/users/user/data/${username}`
      );
      updateUserData({
        role: data.role,
        leagues: data.leagues,
        quinipolosToAnswer: data.quinipolosToAnswer,
        userLeagues: data.userLeagues,
        username: data.username,
        emailAddress: data.emailAddress,
        userId: data.userId,
        hasBeenChecked: true,
      });
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        await signOut();
        navigate("/sign-in");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (
        userData?.emailAddress &&
        userData?.username &&
        userData.isAuthenticated
      ) {
        getUserData(userData.username);
        console.log("userData", userData);
      }
    };
    if (!userData.hasBeenChecked || location.pathname === "/") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, userData.isAuthenticated, userData.username]);

  return (
    <Flex vertical style={{ minHeight: "100vh" }}>
      <MenuBar isSignedIn={isSignedIn} />
      <CookieBanner />
      <Box component="main" sx={{ flex: 1, height: "auto" }}>
        <Container
          maxWidth="lg"
          className="content"
          sx={{ mt: { xs: "88px", md: "100px" } }}
        >
          {children ? children : <Outlet />}
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
};

export default Layout;
