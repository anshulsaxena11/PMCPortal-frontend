import { useEffect } from "react";

const useIdleTimer = (onIdle, timeout = 5 * 60 * 1000) => {
  useEffect(() => {
    let idleTimeout;

    const resetTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(onIdle, timeout);
    };

    const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];

    for (const event of events) {
      window.addEventListener(event, resetTimer);
    }

    resetTimer(); 

    return () => {
      clearTimeout(idleTimeout);
      for (const event of events) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [onIdle, timeout]);
};

export default useIdleTimer;