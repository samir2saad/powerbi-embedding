const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration from environment variables
const config = {
  tenantId: process.env.AZURE_TENANT_ID,
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  workspaceId: process.env.POWERBI_WORKSPACE_ID,
  reportId: process.env.POWERBI_REPORT_ID
};

/**
 * Get Azure AD Access Token
 */
async function getAzureAccessToken() {
  try {
    const tokenEndpoint = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
    
    const params = new URLSearchParams();
    params.append('client_id', config.clientId);
    params.append('client_secret', config.clientSecret);
    params.append('scope', 'https://analysis.windows.net/powerbi/api/.default');
    params.append('grant_type', 'client_credentials');

    const response = await axios.post(tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Azure AD token:', error.response?.data || error.message);
    throw new Error('Failed to get Azure AD access token');
  }
}

/**
 * Get Power BI Embed Token
 */
async function getPowerBIEmbedToken(accessToken) {
  try {
    const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/reports/${config.reportId}/GenerateToken`;
    
    const requestBody = {
      accessLevel: 'View'
    };

    const response = await axios.post(embedTokenUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting Power BI embed token:', error.response?.data || error.message);
    throw new Error('Failed to get Power BI embed token');
  }
}

/**
 * Get Report Details
 */
async function getReportDetails(accessToken) {
  try {
    const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/reports/${config.reportId}`;
    
    const response = await axios.get(reportUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting report details:', error.response?.data || error.message);
    throw new Error('Failed to get report details');
  }
}

/**
 * Get Report Pages and Filters
 */
async function getReportFilters(accessToken) {
  try {
    const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${config.workspaceId}/reports/${config.reportId}/pages`;
    
    const response = await axios.get(reportUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting report pages:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Get Dataset Tables and Columns
 */
async function getDatasetSchema(accessToken, datasetId) {
  try {
    const datasetUrl = `https://api.powerbi.com/v1.0/myorg/datasets/${datasetId}`;
    
    const response = await axios.get(datasetUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting dataset schema:', error.response?.data || error.message);
    return null;
  }
}

/**
 * API Endpoint: Get Available Filters
 * Returns tables and columns available for filtering
 */
app.get('/api/getAvailableFilters', async (req, res) => {
  try {
    console.log('Fetching available filters...');
    
    // Get Azure AD Access Token
    const accessToken = await getAzureAccessToken();
    console.log('✓ Azure AD access token obtained');
    
    // Get Report Details
    const reportDetails = await getReportDetails(accessToken);
    console.log('✓ Report details retrieved');
    
    // Get Dataset Schema
    const datasetSchema = await getDatasetSchema(accessToken, reportDetails.datasetId);
    
    // Get Report Pages (may contain filter info)
    const pagesData = await getReportFilters(accessToken);
    
    res.json({
      reportId: config.reportId,
      reportName: reportDetails.name,
      datasetId: reportDetails.datasetId,
      datasetInfo: datasetSchema,
      pagesInfo: pagesData,
      instruction: 'Use the table and column names from datasetInfo.tables to configure your filters'
    });
    
  } catch (error) {
    console.error('Error in /api/getAvailableFilters:', error.message);
    res.status(500).json({
      error: 'Failed to get available filters',
      message: error.message
    });
  }
});

/**
 * API Endpoint: Get Embed Info
 * Accepts optional filters in request body
 */
app.post('/api/getEmbedInfo', async (req, res) => {
  try {
    console.log('Fetching embed information...');
    
    // Extract filters from request body
    const filters = req.body.filters || null;
    if (filters) {
      console.log('Filters received:', JSON.stringify(filters, null, 2));
    }
    
    // Step 1: Get Azure AD Access Token
    const accessToken = await getAzureAccessToken();
    console.log('✓ Azure AD access token obtained');
    
    // Step 2: Get Report Details
    const reportDetails = await getReportDetails(accessToken);
    console.log('✓ Report details retrieved');
    
    // Step 3: Generate Power BI Embed Token
    const embedTokenData = await getPowerBIEmbedToken(accessToken);
    console.log('✓ Power BI embed token generated');
    if (filters) {
      console.log('✓ Filters will be applied on client-side:', filters);
    }
    
    // Step 4: Return embed configuration
    const embedInfo = {
      reportId: config.reportId,
      embedUrl: reportDetails.embedUrl,
      embedToken: embedTokenData.token,
      tokenExpiry: embedTokenData.expiration,
      reportName: reportDetails.name,
      tokenId: embedTokenData.tokenId,
      datasetId: reportDetails.datasetId,
      filters: filters,
      generatedAt: new Date().toISOString()
    };
    
    console.log(`Token generated at: ${embedInfo.generatedAt}, expires at: ${embedInfo.tokenExpiry}`);
    res.json(embedInfo);
  } catch (error) {
    console.error('Error in /api/getEmbedInfo:', error.message);
    res.status(500).json({
      error: 'Failed to get embed information',
      message: error.message
    });
  }
});

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Power BI Embedding Server is running',
    config: {
      tenantId: config.tenantId,
      clientId: config.clientId,
      workspaceId: config.workspaceId,
      reportId: config.reportId
    }
  });
});

/**
 * Serve Frontend
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Power BI Embedding Server started successfully!`);
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`📊 Open browser to view the embedded report\n`);
  console.log(`Configuration:`);
  console.log(`  - Tenant ID: ${config.tenantId}`);
  console.log(`  - Client ID: ${config.clientId}`);
  console.log(`  - Workspace ID: ${config.workspaceId}`);
  console.log(`  - Report ID: ${config.reportId}\n`);
});
