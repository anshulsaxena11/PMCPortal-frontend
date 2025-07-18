import * as yup from 'yup';

export const userRegistrationValidation = yup.object().shape({
  role: yup.object().required('Role is required').nullable()
});

export default userRegistrationValidation;