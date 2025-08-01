import * as Yup from 'yup';

const changePasswordValidationSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^])/,
      'Password must include uppercase, lowercase, number, and special character'
    ),
  confirmPassword: Yup.string()
    .required('Confirm Password is required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

export default changePasswordValidationSchema;