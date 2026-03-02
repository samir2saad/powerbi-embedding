# Power BI Embedding Demo

A complete Node.js application demonstrating how to embed Power BI reports using Azure AD authentication and Power BI embed tokens.

## 🚀 Features

- **Azure AD Authentication**: Secure token generation using service principal
- **Power BI Embed Token**: Automatic generation of embed tokens for reports
- **Express Backend**: RESTful API for token management
- **Modern Frontend**: Clean, responsive UI with Power BI JavaScript SDK
- **Real-time Status**: Visual feedback for loading and error states
- **Token Management**: Automatic token refresh handling

## 📋 Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v14 or higher) installed
2. **Azure AD App Registration** with:
   - Client ID
   - Client Secret
   - Tenant ID
   - Power BI API permissions (`Tenant.Read.All`, `Tenant.ReadWrite.All`)
3. **Power BI Workspace** with:
   - Workspace ID (Group ID)
   - Report ID
   - Service principal access enabled

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with your credentials:

```env
PORT=8080

# Azure AD Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Power BI Configuration
POWERBI_WORKSPACE_ID=your-workspace-id
POWERBI_REPORT_ID=your-report-id
```

⚠️ **Security Note**: Never commit the `.env` file to version control. It's already added to `.gitignore`.

### 3. Run the Application

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start at `http://localhost:8080`

## 📁 Project Structure

```
powerbi-embedding-demo/
├── public/
│   ├── index.html          # Frontend HTML
│   └── app.js              # Frontend JavaScript
├── server.js               # Express backend server
├── .env                    # Environment configuration
├── .gitignore             # Git ignore rules
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## 🔌 API Endpoints

### GET `/api/getEmbedInfo`
Returns embed configuration for Power BI report.

**Response:**
```json
{
  "reportId": "572b185e-0e5f-429f-9454-ffd189bca0b9",
  "embedUrl": "https://app.powerbi.com/reportEmbed?...",
  "embedToken": "H4sIAAAAAAAEAB2Ux...",
  "tokenExpiry": "2026-03-02T16:30:00Z",
  "reportName": "Sales Report"
}
```

### GET `/api/health`
Health check endpoint to verify server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Power BI Embedding Server is running",
  "config": {
    "tenantId": "...",
    "clientId": "...",
    "workspaceId": "...",
    "reportId": "..."
  }
}
```

## 🔐 Authentication Flow

1. **Azure AD Token**: Server requests access token from Azure AD using client credentials
2. **Report Details**: Server fetches report metadata from Power BI API
3. **Embed Token**: Server generates embed token for the specific report
4. **Frontend Embedding**: Client receives embed configuration and renders the report

## 🛠️ Troubleshooting

### Common Issues

**Error: "Failed to get Azure AD access token"**
- Verify your Azure AD credentials in `.env`
- Ensure the service principal has proper permissions
- Check if the client secret is still valid

**Error: "Failed to get Power BI embed token"**
- Verify the workspace ID and report ID are correct
- Ensure the service principal has access to the workspace
- Check if the workspace has "Service principal access" enabled

**Report not loading**
- Check browser console for detailed error messages
- Verify the embed URL is accessible
- Ensure the token hasn't expired

### Enable Service Principal Access

1. Go to Power BI Admin Portal
2. Navigate to Tenant Settings
3. Enable "Allow service principals to use Power BI APIs"
4. Add your service principal to the workspace with at least "Viewer" role

## 📚 References

- [Power BI Embedded Documentation](https://docs.microsoft.com/en-us/power-bi/developer/embedded/)
- [Power BI JavaScript SDK](https://github.com/Microsoft/PowerBI-JavaScript)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

## 📝 License

ISC

## 👤 Author

Created for Power BI embedding demonstration purposes.
