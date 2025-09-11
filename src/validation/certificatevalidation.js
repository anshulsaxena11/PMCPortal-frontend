import * as yup from 'yup';

const certificateValidation = yup.object({
    certificateName: yup.string().required("Name of Certifiicate is required"),
    assignedPerson: yup.string().required("Name of Assigned Person is required"),
    issuedDate: yup.date().required("Issued Date is required").nullable(),
    validUpto:yup.date().transform((value, originalValue) => {
        return originalValue === '' || originalValue === null ? null : new Date(originalValue);
      })
      .nullable()
      .required("Valid Upto is required")
      .when('issuedDate', {
        is: (issuedDate) => issuedDate !== null,
        then: yup
          .date()
          .min(yup.ref('issuedDate'), 'Valid Date must be later than Issued Date'),
        }),
    uploadeCertificate:yup
      .mixed()
      .required('A file is required').test('fileSize', 'File size must be less than or equal to 5MB', (value) => {
          return value && value instanceof File && value.size <= 5 * 1024 * 1024;
        }).test('fileType', 'Unsupported file format', (value) => {
          return value && ['application/pdf', 'image/jpeg', 'image/jpg'].includes(value.type);
        })

})

export default certificateValidation;