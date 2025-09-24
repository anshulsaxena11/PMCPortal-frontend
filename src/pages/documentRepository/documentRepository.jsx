import React, { useState } from "react";
import Heading from "../../components/Heading/heading";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Stack, Button } from "@mui/material";
import PreviewModal from "../../components/previewfile/preview"; 

const DocumentRepository = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);

  const rows = [
    {
        id: 1,
        document: "Sample Of STPI Registration",
        preview: "/Document/STPI_Registration.pdf",
        type: "application/pdf",
    },
    {
        id: 2,
        document: "Sample of STPI GST Certificate",
        preview: "/Document/STPI Noida_GST Certificate.pdf",
        type: "application/pdf",
    },
    {
        id: 3,
        document: "Sample of STPI Pan Card",
        preview: "/Document/PAN Card STPI.pdf",
        type: "application/pdf",
    },
    {
        id: 4,
        document: "Sample of Cert-In Empanelment Letter",
        preview: "/Document/Cert-In Empanelment Letter.pdf",
        type: "application/pdf",
    },
    {
        id: 5,
        document: "Sample of Cancelled Cheque",
        preview: "/Document/Cancelled cheque.pdf",
        type: "application/pdf",
    },
    {
        id: 6,
        document: "Sample of Annual Account",
        preview: "/Document/Annual Accounts 2023-24.pdf",
        type: "application/pdf",
    },
    {
        id: 7,
        document: "Sample of ISO and ISMS",
        preview: "/Document/ISO and ISMS.pdf",
        type: "application/pdf",
    },
    {
        id: 8,
        document: "Sample of Net Worth Certificate",
        preview: "/Document/Net Worth Certificate 2020-21_22_23",
        type: "application/pdf",
    },
  ];

  const columns = [
    { field: "id", headerName: "S.No", width: 100 },
    { field: "document", headerName: "Document", flex: 1 },
    {
      field: "preview",
      headerName: "Preview File",
      width: 200,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => {
            setSelectedFile(params.row.preview);
            setFileType(params.row.type);
            setPreviewOpen(true);
          }}
        >
          Preview
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Heading title="STPI Document Repository" />
      </Stack>
      <hr />

      <Box sx={{ height: 'auto', width: "100%", mt: 2 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0
              ? "even-row"
              : "odd-row"
          }
          sx={{
            "& .even-row": {
              backgroundColor: "#f5f5f5",
            },
            "& .odd-row": {
              backgroundColor: "#ffffff",
            },
            "& .row-expiring-soon": {
              backgroundColor: "#96842385 !important",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#AAC9D5",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: "#AAC9D5",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#e3f2fd !important",
            },
            "& .MuiDataGrid-overlay": {
              color: "red",
              fontWeight: "bold",
              fontSize: "16px",
            },
            "& p": {
              padding: 0,
              margin: 0,
            },
          }}
        />
      </Box>

      <PreviewModal
        show={previewOpen}
        onHide={() => setPreviewOpen(false)}
        preview={selectedFile}
        fileType={fileType}
      />
    </Box>
  );
};

export default DocumentRepository;
