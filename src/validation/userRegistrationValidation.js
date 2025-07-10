import * as yup from 'yup';

export const userRegistrationValidation = yup.object().shape({
  username: yup.string().email("Invalid Email Format").required('Username is required'),
  password: yup
    .string()
    .required('Password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^])[A-Za-z\d@$!%*?#&^]{8,}$/,
      'Password must be at least 8 characters with upper, lower, number and special char'
    ),
  role: yup.object().required('Role is required').nullable()
});

export default userRegistrationValidation;