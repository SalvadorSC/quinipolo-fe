import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../../lib/supabaseClient";
import { apiGet } from "../../utils/apiUtils";

// Define a type for Leagues

type Leagues = {
  leagueId: string;
  moderatorArray: string[];
  leagueName: string;
  participants: string[];
  leagueImage: string;
};

// Define a type for your context state
export type UserDataType = {
  role: string;
  leagues: Leagues[];
  quinipolosToAnswer: any[];
  userId: string;
  userLeagues: Array<{ league_id: string; role: string }>;
  emailAddress: string;
  username: string;
  hasBeenChecked: boolean;
  stripeCustomerId?: string;
  isPro?: boolean;
  productId?: string;
  isAuthenticated: boolean;
};

// Define a type for the context value
type UserContextType = {
  userData: UserDataType;
  updateUser: (newData: any) => void;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
};

// Create a context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define a type for the provider props
type UserProviderProps = {
  children: ReactNode;
};

// Export the provider as a named export
export const UserProvider = ({ children }: UserProviderProps) => {
  const [userData, setUserData] = useState<UserDataType>({
    role: "",
    leagues: [],
    quinipolosToAnswer: [],
    userId: localStorage.getItem("userId") ?? "",
    userLeagues: [],
    emailAddress: "",
    username: localStorage.getItem("username") ?? "",
    hasBeenChecked: false,
    isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
  });

  const updateUser = useCallback((newData: Partial<UserDataType>) => {
    setUserData((prevData) => {
      const merged = { ...prevData, ...newData };
      // Only update if something actually changed
      const changed = Object.keys(newData).some(
        (key) =>
          merged[key as keyof UserDataType] !==
          prevData[key as keyof UserDataType]
      );
      if (changed) {
        // Optionally update localStorage for specific fields
        if (newData.userId) localStorage.setItem("userId", newData.userId);
        if (newData.username)
          localStorage.setItem("username", newData.username);
        if (newData.emailAddress)
          localStorage.setItem("emailAddress", newData.emailAddress);
        return merged;
      }
      return prevData;
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Clear user data
      setUserData({
        role: "",
        leagues: [],
        quinipolosToAnswer: [],
        userId: "",
        userLeagues: [],
        emailAddress: "",
        username: "",
        hasBeenChecked: false,
        isAuthenticated: false,
      });
      // Clear localStorage
      // move the user to the home page
      window.location.href = "/";
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("emailAddress");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  // Function to manually refresh user data
  const refreshUserData = useCallback(async () => {
    if (userData.isAuthenticated && userData.userId) {
      try {
        const profile = await apiGet<UserDataType>("/api/users/me/profile");

        // Sort leagues to put global league first
        const leagues = profile.leagues || [];
        leagues.sort((a, b) =>
          a.leagueId === "global" ? -1 : b.leagueId === "global" ? 1 : 0
        );

        updateUser({
          ...profile,
          leagues,
          hasBeenChecked: true,
          isAuthenticated: true,
        });
      } catch (error: any) {
        console.error("Error refreshing user profile:", error);
        // If it's an authentication error, clear the session
        if (error.response?.status === 401) {
          await signOut();
        }
      }
    }
  }, [userData.isAuthenticated, userData.userId, updateUser, signOut]);

  // Fetch user profile data on mount if authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (
        userData.isAuthenticated &&
        userData.userId &&
        !userData.hasBeenChecked
      ) {
        try {
          const profile = await apiGet<UserDataType>("/api/users/me/profile");

          // Sort leagues to put global league first
          const leagues = profile.leagues || [];
          leagues.sort((a, b) =>
            a.leagueId === "global" ? -1 : b.leagueId === "global" ? 1 : 0
          );

          updateUser({
            ...profile,
            leagues,
            hasBeenChecked: true,
          });
        } catch (error: any) {
          console.error("Error fetching user profile on page reload:", error);
          // If it's an authentication error, clear the session
          if (error.response?.status === 401) {
            await signOut();
          }
        }
      }
    };

    fetchUserProfile();
  }, [
    userData.isAuthenticated,
    userData.userId,
    userData.hasBeenChecked,
    updateUser,
    signOut,
  ]);

  return (
    <UserContext.Provider
      value={{ userData, updateUser, signOut, refreshUserData }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Alias for backward compatibility
export const useUserData = useUser;
