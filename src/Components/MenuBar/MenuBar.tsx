import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logoNew from "../../assets/LOGOS_2025/logo_solo_letras_horizontal.svg";

import { useUser as useUserData } from "../../Context/UserContext/UserContext";
import {
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Toolbar,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Divider, Select } from "antd";
import MenuIcon from "@mui/icons-material/Menu";

import { useTheme } from "../../Context/ThemeContext/ThemeContext";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useTranslation } from "react-i18next";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  }),
}));

const LANGUAGES = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "ca", label: "CA" },
  { value: "fr", label: "FR" },
  { value: "de", label: "DE" },
  { value: "it", label: "IT" },
  { value: "pt", label: "PT" },
  { value: "ja", label: "JA" },
  { value: "zh", label: "ZH" },
];

export const MenuBar = () => {
  const navigate = useNavigate();
  const { userData, signOut } = useUserData();
  const { theme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    if (!userData.hasBeenChecked || location.pathname === "/") {
      console.log("userData", userData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, userData.isAuthenticated, userData.username]);

  const logoStyle = {
    width: "140px",
    height: "auto",
    marginLeft: "15px",
    cursor: "pointer",
  };
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  // Replace isSignedIn with your own logic
  const isSignedIn = userData.isAuthenticated;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/sign-in");
      setOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Language picker component
  const LanguagePicker = ({ inDrawer = false }) => (
    <Select
      value={i18n.language}
      onChange={(value) => i18n.changeLanguage(value)}
      options={LANGUAGES}
      size={inDrawer ? "large" : "small"}
      style={{
        minWidth: 60,
        fontSize: inDrawer ? 18 : 12,
        marginLeft: inDrawer ? 0 : 8,
        marginRight: inDrawer ? 0 : 8,
        display: inDrawer ? "block" : isMobile ? "none" : "inline-block",
      }}
      getPopupContainer={(trigger) => document.body}
      dropdownStyle={{ zIndex: 3000 }}
    />
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          mt: 2,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            variant="regular"
            sx={() => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              borderRadius: "999px",
              bgcolor: theme === "light" ? "#f4f6fb" : "#121212",
              backgroundImage:
                theme === "light"
                  ? "none"
                  : "linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))",
              backdropFilter: "blur(24px)",
              maxHeight: 40,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`,
            })}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: "6px",
                ml: "-8px",
                px: 0,
              }}
            >
              <img
                src={logoNew}
                style={logoStyle}
                alt="logo of quinipolo"
                onClick={() => navigate("/")}
              />
              <Box sx={{ display: { xs: "none", lg: "flex" } }}>
                <ThemeToggle mode="icon" />
                {!isMobile && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <LanguagePicker />
                  </Box>
                )}
                {isSignedIn ? (
                  <>
                    <Button
                      variant="text"
                      onClick={() => navigate("/profile")}
                      sx={{ ml: 2 }}
                    >
                      {t("profile") || "Profile"}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleSignOut}
                      sx={{ ml: 2 }}
                    >
                      {t("signOut")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate("/sign-in")}
                    sx={{ ml: 2 }}
                  >
                    {t("signIn")}
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ display: { sm: "", md: "none" } }}>
              {isSignedIn && (
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={() => setOpen(true)}
                  sx={{ ml: 1 }}
                >
                  <MenuIcon
                    sx={{ color: theme === "light" ? "black" : "white" }}
                  />
                </IconButton>
              )}
              <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <Box
                  sx={{
                    minWidth: "70dvw",
                    p: 2,
                    backgroundColor: "background.paper",
                    flexGrow: 1,
                  }}
                >
                  {isSignedIn ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexDirection: "column",
                        maxWidth: "240px",
                        gap: 10,
                        margin: "0 auto",
                      }}
                    >
                      <List sx={{ width: "100%" }}>
                        <ListItem
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "space-between",
                            marginBottom: 2,
                          }}
                        >
                          <LanguagePicker inDrawer />
                          <ThemeToggle mode="icon" />
                        </ListItem>
                        <Divider />
                        <ListItem
                          button
                          onClick={() => {
                            navigate("/");
                            setOpen(false);
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          <DashboardOutlinedIcon sx={{ mr: 1 }} />
                          <ListItemText
                            primary={t("dashboard") || "Dashboard"}
                          />
                        </ListItem>
                        <ListItem
                          button
                          onClick={() => {
                            navigate("/join-league");
                            setOpen(false);
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          <GroupsOutlinedIcon sx={{ mr: 1 }} />
                          <ListItemText primary={t("leagues") || "Leagues"} />
                        </ListItem>
                        <ListItem
                          button
                          onClick={() => {
                            navigate("/profile");
                            setOpen(false);
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          <AccountCircleOutlinedIcon sx={{ mr: 1 }} />
                          <ListItemText primary={t("profile") || "Profile"} />
                        </ListItem>
                      </List>
                    </div>
                  ) : null}
                </Box>
              </Drawer>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {isSignedIn ? (
        <Container
          maxWidth="lg"
          className="content"
          sx={{ mt: window.innerWidth > 400 ? "100px" : "88px" }}
        >
          <Outlet />
        </Container>
      ) : null}
    </>
  );
};

export default MenuBar;
