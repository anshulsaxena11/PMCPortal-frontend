import { useEffect, useRef } from "react";
import { validateToken } from "../api/loginApi/loginApi"; // Ensure this returns 401 if session expired

const useIdleTimer = (onIdle, timeout = 1* 60 * 1000) => {
  const idleTimeoutRef = useRef(null);
  const sessionCheckRef = useRef(null);
  const hasLoggedOutRef = useRef(false);

  useEffect(() => {
    const logoutIfNeeded = () => {
      if (!hasLoggedOutRef.current) {
        hasLoggedOutRef.current = true;
        onIdle();
      }
    };

    const resetIdleTimer = () => {
      if (hasLoggedOutRef.current) return;
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(logoutIfNeeded, timeout);
    };

    const checkSession = async () => {
      try {
        await validateToken(); // This should return 401 or error if session is invalid
      } catch (err) {
        logoutIfNeeded(); // Triggers if session is expired
      }
    };

    const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();
    sessionCheckRef.current = setInterval(checkSession, 60000); // every 1 min

    return () => {
      clearTimeout(idleTimeoutRef.current);
      clearInterval(sessionCheckRef.current);
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, [onIdle, timeout]);
};

export default useIdleTimer;
