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
  SecondaryEmail: yup.string().transform((value) => (value === "" || value === undefined || value === null ? "N/A" : value)).test("email-or-na", "Invalid email format", (value) => {
    if (value === "N/A") return true; 
    return yup.string().email().isValidSync(value); 
  }),
  selectedProjectTypes: yup.array()
  .min(1, 'You must select at least one project type')
  .required('Project type is required'),
  workOrder:yup
  .mixed()
  .required('A file is required').test('fileSize', 'File size must be less than or equal to 5MB', (value) => {
      return value && value instanceof File && value.size <= 5 * 1024 * 1024;
    }).test('fileType', 'Unsupported file format', (value) => {
      return value && ['application/pdf', 'image/jpeg', 'image/jpg'].includes(value.type);
    })
});

export default validationSchema;