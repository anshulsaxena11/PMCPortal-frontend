import * as yup from 'yup';

const validationSchema = yup.object({
  workOrderNo: yup.string().required("work Order is required"),
  orderType:yup.string().required("Select One Type"),
  type:yup.string().required("Select One Type"),
  OrganisationName: yup.string().required("Organisation Name is required"),
  startDate: yup.date()
  .required("Start Date is required")
  .nullable(),
  endDate: yup.date()
    .required("End Date is required")
    .nullable()
    .when('startDate', {
    is: (startDate) => startDate !== null,  
    then: yup.date().min(
      yup.ref('startDate'),  
      'End Date must be later than Start Date'
    ),
    otherwise: yup.date(), 
  }),
  ProjectName: yup.string().required("Project Name is required"),
  device:yup.string(),
  ProjectValue: yup.number().positive().required("Project Value is required"),
  ServiceLoction: yup.string().required("Service Location is required"),
  DirectrateName: yup.string().required("Directrate Name is required"),
  typeOfWork: yup.string().required("Type Of Work Required"),
  PrimaryFullName: yup.string().required("Primary Full Name is required"),
  SecondaryFullName: yup.string(),
  PrimaryPhoneNo: yup.string().matches(/^\d{10}$/, "Primary Phone Number must be 10 digits").required("Primary Phone Number is required"),
  SecondaryPhoneNo: yup.string().nullable().notRequired().matches(/^\d{10}$/, {message:"Secondary Phone Number must be 10 digits", excludeEmptyString: true},),
  PrimaryEmail: yup.string().email("Invalid email format").required("Primary Email is required"),
  projectManager: yup.string().required("Project Manager Name is required"),
  // noOfauditor:yup.number().positive().required("auditor Value is required"),
  SecondaryEmail: yup.string().email("Invalid email format"),
  selectedProjectTypes: yup.array()
  .min(1, 'You must select at least one project type')
  .required('Project type is required'),
  workOrder:yup
  .mixed()
  .required('A file is required')
 
});

export default validationSchema;