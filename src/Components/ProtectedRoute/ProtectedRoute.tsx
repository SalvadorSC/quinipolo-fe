import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext/UserContext";
import { isSystemAdmin } from "../../utils/moderatorUtils";
import { CircularProgress, Box, Typography } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  fallbackPath = "/",
}) => {
  const { userData } = useUser();

  // Show loading while authentication is being initialized
  if (!userData.authInitialized) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!userData.isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  // Check admin permissions if required
  if (requireAdmin && !isSystemAdmin(userData.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
