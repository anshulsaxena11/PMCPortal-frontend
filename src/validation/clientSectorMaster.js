import * as yup from 'yup';

const clientSectorMasterSchema = yup.object({
    type: yup.string().required("Select One Type"),
    clientType:yup.string().required("Client sector required"),
})

export default clientSectorMasterSchema;