import * as Yup from 'yup';

const checkEmailValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username or E-Mail is required')
});

export default checkEmailValidationSchema;