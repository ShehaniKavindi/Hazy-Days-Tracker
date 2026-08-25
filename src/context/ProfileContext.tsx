import { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileContext = createContext(null);
const STORAGE_KEY = "hazy-days:profile";

// Preset profile picture choices.
export const AVATAR_OPTIONS = [
  { id: "pfp1", label: "1", image: require("@/assets/images/pfp/1.jpg") },
  { id: "pfp2", label: "2", image: require("@/assets/images/pfp/2.jpg") },
  { id: "pfp3", label: "3", image: require("@/assets/images/pfp/3.jpg") },
  { id: "pfp4", label: "4", image: require("@/assets/images/pfp/4.jpg") },
  { id: "pfp5", label: "5", image: require("@/assets/images/pfp/5.jpg") },
  { id: "pfp6", label: "6", image: require("@/assets/images/pfp/6.jpg") },
  { id: "pfp7", label: "7", image: require("@/assets/images/pfp/7.jpg") },
  { id: "pfp8", label: "8", image: require("@/assets/images/pfp/8.jpg") },
];

const DEFAULT_PROFILE = {
  name: "Idiot",
  avatarId: "pfp2",
  nickname: "",
  goalNote: "",
};

export function getAvatarImage(avatarId) {
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return found ? found.image : AVATAR_OPTIONS[0].image;
}

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(DEFAULT_PROFILE);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydrated = useRef(false);

  // Load whatever was saved last time, once, on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setProfileState({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
        }
      } catch (err) {
        console.warn("Failed to load saved profile:", err);
      } finally {
        hasHydrated.current = true;
        setIsHydrated(true);
      }
    })();
  }, []);


  useEffect(() => {
    if (!hasHydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile)).catch((err) => {
      console.warn("Failed to save profile:", err);
    });
  }, [profile]);

  function updateProfile(partial) {
    setProfileState((prev) => ({ ...prev, ...partial }));
  }

  const value = { profile, updateProfile, isHydrated };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}
