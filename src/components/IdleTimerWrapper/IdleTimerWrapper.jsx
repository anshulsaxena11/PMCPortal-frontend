import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useIdleTimer from "../../hooks/LogoutTimer"; // your custom hook
import { logoutUser } from "../../api/loginApi/loginApi";

const IdleTimerWrapper = () => {
  const navigate = useNavigate();

  const handleIdle = async () => {
   
    const result = await Swal.fire({
      title: "You’ve been idle!",
      text: "You will be logged out in 10 seconds. Do you want to stay logged in?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Stay Logged In",
      cancelButtonText: "Logout Now",
      timer: 10000,
      timerProgressBar: true,
      allowOutsideClick: false,
    });

    if (
      result.dismiss === Swal.DismissReason.timer ||
      result.isDismissed ||
      result.isDenied ||
      result.isCanceled
    ) {
      await logoutUser();
      localStorage.clear();
      Swal.fire({
        icon: "info",
        title: "Logged Out",
        text: "You have been logged out due to inactivity.",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate("/login");
    }
  };

  useIdleTimer(handleIdle, 5* 60 * 1000, 1 * 60 * 1000); 


  return null;
};

export default IdleTimerWrapper;