# CHOC Meeting Sign-In Portal

A comprehensive dual-purpose sign-in system for meeting attendance and volunteer service tracking with real-time synchronization, geofencing, and administrative controls.

## 🌟 Features

### Core Functionality
- **Dual Sign-In System**: Separate tracking for meeting attendance and volunteer service
- **Real-Time Sync**: WebSocket-based synchronization across all devices
- **Geofencing**: Location-based access control with customizable radius
- **Device Tracking**: Prevents duplicate sign-ins from the same device
- **Time Windows**: Configurable sign-in periods

### Administrative Features
- **Officer Dashboard**: Basic meeting management and member oversight
- **Administration Panel**: Advanced settings, proximity monitoring, and system configuration
- **Alert System**: Automated notifications for suspicious activities and system events
- **Data Export**: CSV export for attendance records and volunteer hours
- **Backup/Restore**: Complete data management capabilities

### Security & Monitoring
- **Two-Tier Access**: Officer (CHOC12345) and Admin (Alcremie2026) access levels
- **Proximity Monitoring**: GPS tracking for attendance verification
- **Blacklist Management**: Restrict access for specific student IDs
- **Alert System**: Real-time notifications for security events

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd choc-meeting-signin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3001`

## 📱 Usage

### For Members
1. **Meeting Sign-In**: Click "Meeting Sign-In" when the sign-in window is open
2. **Volunteer Service**: Click "Volunteer Service" to sign in/out for volunteer work
3. **Location**: Ensure you're within the geofenced area (if enabled)

### For Staff
1. **Officer Access**: Use code `CHOC12345` for basic controls
2. **Administration**: Use code `Alcremie2026` for advanced features
3. **Settings**: Configure sign-in windows, geofencing, and system preferences

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

### Default Access Codes
- **Officer**: `CHOC12345`
- **Administration**: `Alcremie2026`

*Change these in the admin panel after first setup*

## 📊 Data Management

### Exports
- **Meeting Attendance**: CSV export with names, IDs, grades, and timestamps
- **Volunteer Hours**: CSV export with service types, durations, and summaries
- **System Backup**: Complete JSON backup of all data

### Data Storage
- In-memory storage (resets on server restart)
- Real-time synchronization across all connected clients
- Automatic data validation and sanitization

## 🌐 Deployment

### Render Deployment (Recommended)
1. **GitHub Setup**:
   - Push your code to a GitHub repository
   - Ensure all files are committed and pushed

2. **Render Setup**:
   - Connect your GitHub repository to Render
   - Render will automatically detect the `render.yaml` configuration
   - Set environment variables if needed:
     - `NODE_ENV=production`
     - `PORT` (automatically set by Render)

3. **Automatic Deployment**:
   - Deploys automatically on push to main branch
   - Uses the free tier (suitable for development/testing)
   - Includes health checks and auto-restart

### Manual Deployment
1. Build for production:
   ```bash
   npm install --production
   ```
2. Start production server:
   ```bash
   npm run start:prod
   ```

### Environment Variables
- `NODE_ENV`: Set to `production` for deployment
- `PORT`: Automatically set by Render (default: 3001 for local)

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Update access codes in admin panel
- [ ] Test all features locally
- [ ] Verify geofencing settings
- [ ] Check WebSocket connectivity
- [ ] Test on mobile devices
- [ ] Backup any existing data
- [ ] Update repository URL in package.json

## 🔒 Security Features

- **Geofencing**: Location-based access control
- **Device Fingerprinting**: Prevents duplicate sign-ins
- **Access Control**: Two-tier authentication system
- **Input Validation**: Sanitized form inputs and data validation
- **Real-Time Monitoring**: Live tracking of all activities

## 📋 System Requirements

### Client-Side
- Modern web browser with JavaScript enabled
- Location services (for geofencing)
- Stable internet connection

### Server-Side
- Node.js runtime environment
- WebSocket support
- Sufficient memory for real-time data storage

## 🛠️ Development

### File Structure
```
├── index.html          # Main application interface
├── script.js           # Client-side JavaScript
├── styles.css          # Application styling
├── server.js           # Node.js server with WebSocket
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

### Key Technologies
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Node.js with Express
- **Real-Time**: Socket.IO for WebSocket communication
- **Styling**: Custom CSS with kawaii theme

## 📞 Support

For technical support or feature requests, please contact the development team or create an issue in the repository.

## 📄 License

This project is proprietary software developed for BGHS CHOC organization.

---

**Version**: 2.0.0  
**Last Updated**: January 2026  
**Developed for**: BGHS CHOC Room 316