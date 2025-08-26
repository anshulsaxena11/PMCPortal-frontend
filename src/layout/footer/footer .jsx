import React from 'react';
import { Box, Typography, Container, Grid } from '@mui/material';

const drawerWidth = 240;
const miniDrawerWidth = 70;

const Footer = ({ isSidebarExpanded }) => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        py: 3,
        mt: 'auto',
        transition: 'margin-left 0.3s ease-in-out',
        marginLeft: isSidebarExpanded ? `${drawerWidth}px` : `${miniDrawerWidth}px`,
         zIndex: 1200,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={1} justifyContent="space-between" alignItems="center">
          <Grid
            item
            xs={12}
            md={4}
            sx={{
                ml: isSidebarExpanded ? `${0}px` : `${0}px`, 
                transition: 'margin-left 0.3s ease-in-out',
            }}
            >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                STPI
            </Typography>
            <Typography variant="body2">
                Software Technology Parks of India
            </Typography>
        </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'left' } }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Support
            </Typography>
            <Typography variant="body2">
                E-Mail :- pavitra@stpi.in
            </Typography>
            <Typography variant="body2">
                Mobile :- +91 9899647440
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} STPI. All rights reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
