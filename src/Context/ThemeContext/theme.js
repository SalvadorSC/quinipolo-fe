import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#286fdf", // primary color
    },
    secondary: {
      main: "#9cb3d8", // secondary color
    },
    background: {
      default: "#f3f5f9", // background color
      paper: "#fff", // paper background
    },
    text: {
      primary: "#0c0f14", // primary text color
      secondary: "#799bd2", // secondary text color
    },
    accent: {
      main: "#799bd2", // accent color
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2065d5", // primary color
    },
    secondary: {
      main: "#273e62", // secondary color
    },
    background: {
      default: "#07090e", // background color
      paper: "#121212", // paper background
    },
    text: {
      primary: "#eceff4", // primary text color
      secondary: "#2d4f86", // secondary text color
    },
    accent: {
      main: "#2d4f86", // accent color
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
