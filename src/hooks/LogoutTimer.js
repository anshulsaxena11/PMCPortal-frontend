import { useEffect, useRef } from "react";
import { validateToken } from "../api/loginApi/loginApi"; // Should return 401 if session expired

const useIdleTimer = (onIdle, idleTimeout, sessionInterval) => {
  const idleTimeoutRef = useRef(null);
  const sessionCheckRef = useRef(null);
  const hasLoggedOutRef = useRef(false);

  useEffect(() => {
    const logoutIfNeeded = (reason) => {
      if (!hasLoggedOutRef.current) {
        hasLoggedOutRef.current = true;
        onIdle(reason); 
      }
    };

    const resetIdleTimer = () => {
      if (hasLoggedOutRef.current) return;
      clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(() => logoutIfNeeded("idle"), idleTimeout);
    };

    const checkSession = async () => {
      try {
        const result = await validateToken();
        console.log("Session still valid:", result);
      } catch (err) {
        console.warn("Session expired or invalid:", err);
        logoutIfNeeded("sessionExpired");
      }
    };

    const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer(); 
    sessionCheckRef.current = setInterval(checkSession, sessionInterval); 

    return () => {
      clearTimeout(idleTimeoutRef.current);
      clearInterval(sessionCheckRef.current);
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
    };
  }, [onIdle, idleTimeout, sessionInterval]);
};

export default useIdleTimer;
