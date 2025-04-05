import { useState, useCallback } from "react";

export const useGuestName = (user) => {
  const [guestName, setGuestName] = useState(
    user?.isGuest ? user.username : null
  );

  const currentUsername = user?.username || guestName;

  const handleNameSubmit = useCallback((name) => {
    const uniqueName = `${name}_${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem("guestName", uniqueName);
    setGuestName(uniqueName);
  }, []);

  return { currentUsername, handleNameSubmit };
};
