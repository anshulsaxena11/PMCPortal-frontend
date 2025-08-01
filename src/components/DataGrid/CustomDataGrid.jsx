// components/CustomDataGrid.jsx
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";

const CustomDataGrid = ({
  rows,
  columns,
  pageSize = 10,
  rowHeight = 52,
  loading = false,
  getRowId = (row) => row.id,
  onRowClick,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  checkboxSelection = false,
  paginationMode = "server", // or "client"
}) => {
  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
       autoSizeOptions={{ disableHeight: false }}
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={getRowId}
        checkboxSelection={checkboxSelection}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={rowCount}
        paginationMode={paginationMode}
        rowHeight={rowHeight}
        disableRowSelectionOnClick
        onRowClick={onRowClick}
      />
    </Box>
  );
};

export default CustomDataGrid;
