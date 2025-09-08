import * as yup from 'yup';

const scopeOfWorkSchema = yup.object({ 
  category: yup.string().required("Type Of Work Required"),
  ProjectTypeName: yup.string().required("Scope Of Work Required")
});

export default scopeOfWorkSchema;
