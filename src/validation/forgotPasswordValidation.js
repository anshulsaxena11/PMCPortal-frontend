import * as yup from 'yup';

const forgetPasswordValidationSchema = yup.object().shape({
    username: yup.string().required('Username is required'),
})
  
export default forgetPasswordValidationSchema;