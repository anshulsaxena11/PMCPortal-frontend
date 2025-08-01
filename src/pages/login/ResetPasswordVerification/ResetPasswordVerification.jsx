import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../../api/loginApi/loginApi'
import Swal from 'sweetalert2';

const ResetPasswordVerify = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        Swal.fire('Error', 'Invalid or missing token', 'error');
        navigate('/login');
        return;
      }

      try {
        const response = await resetPassword(token);
       if (response?.statusCode === 200) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response?.message,
            timer: 2000, 
            showConfirmButton: false,
        }).then(() => {
            navigate('/login');
        });
        }
      } catch (error) {
        if(error?.response?.data?.statusCode === 400 ){
                Swal.fire({
                icon: 'Error',
                title: 'Error',
                text: error?.response?.data?.message,
                timer: 2000, 
                showConfirmButton: false,
            });
            navigate('/login');
        } else if(error?.response?.data?.statusCode === 401 ){
            Swal.fire({
                icon: 'Error',
                title: 'Error',
                text: error?.response?.data?.message,
                timer: 2000, 
                showConfirmButton: false,
            });
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      {loading ? <h3>Verifying your password reset request...</h3> : null}
    </div>
  );
};

export default ResetPasswordVerify;
