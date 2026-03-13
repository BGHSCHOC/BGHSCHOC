const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('.'));

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// In-memory storage (in production, use a database)
let meetingData = {
    settings: {
        enabled: false,
        startTime: null,
        endTime: null
    },
    geofenceEnabled: false,
    geofenceDistance: 100,
    meetingLocation: null,
    members: [], // Meeting attendees
    volunteerSessions: [], // Completed volunteer sessions
    activeVolunteers: [], // Currently signed-in volunteers
    signedInDevices: [],
    locationDescription: '', // Meeting location description
    memberProfiles: {}, // Store member profile data
    blacklistedIds: [], // Store blacklisted student IDs
    systemSettings: {
        sessionTimeout: 60,
        securityPolicy: 'standard'
    },
    passwords: {
        officer: 'CHOC12345',
        admin: 'Alcremie2026'
    },
    alerts: [],
    alertSettings: {
        suspiciousActivity: true,
        geofenceViolations: true,
        deviceAnomalies: true,
        systemHealth: true
    }
};

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send current data to new client
    socket.emit('sync-data', meetingData);

    // Handle settings updates
    socket.on('update-settings', (data) => {
        meetingData.settings = { ...meetingData.settings, ...data };
        console.log('Settings updated:', data);
        // Broadcast to all clients
        io.emit('sync-data', meetingData);
    });

    // Handle geofencing updates
    socket.on('update-geofencing', (data) => {
        meetingData.geofenceEnabled = data.enabled;
        meetingData.meetingLocation = data.location;
        console.log('Geofencing updated:', data);
        io.emit('sync-data', meetingData);
    });

    // Handle geofence distance updates
    socket.on('update-geofence-distance', (data) => {
        meetingData.geofenceDistance = data.distance;
        console.log('Geofence distance updated:', data.distance + 'm');
        io.emit('sync-data', meetingData);
    });

    // Handle member sign-in
    socket.on('meeting-signin', (memberData) => {
        // Check for duplicate student ID
        const existingMember = meetingData.members.find(m => m.studentId === memberData.studentId);
        if (existingMember) {
            socket.emit('signin-error', 'Student ID already registered');
            return;
        }

        // Check for duplicate device
        if (meetingData.signedInDevices.includes(memberData.deviceId)) {
            socket.emit('signin-error', 'This device has already been used to sign in');
            return;
        }

        // Add member with location data
        const member = {
            ...memberData,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            location: memberData.location || null // Store location data if available
        };

        meetingData.members.push(member);
        meetingData.signedInDevices.push(memberData.deviceId);

        console.log('Member signed in:', member.fullName, memberData.location ? `(Location: ${memberData.location.latitude.toFixed(6)}, ${memberData.location.longitude.toFixed(6)})` : '(No location data)');

        // Broadcast to all clients
        io.emit('sync-data', meetingData);
        socket.emit('signin-success', 'Successfully signed in to meeting!');
    });

    // Handle volunteer sign-in
    socket.on('volunteer-signin', (volunteerData) => {
        console.log('🤝 Volunteer sign-in received:', volunteerData);

        // Check if already signed in
        const existingVolunteer = meetingData.activeVolunteers.find(v => v.studentId === volunteerData.studentId);
        if (existingVolunteer) {
            console.log('❌ Volunteer already signed in:', volunteerData.studentId);
            socket.emit('signin-error', 'Already signed in for volunteer service');
            return;
        }

        // Add to active volunteers
        const volunteer = {
            ...volunteerData,
            id: Date.now(),
            signInTime: volunteerData.signInTime,
            location: volunteerData.location || null
        };

        meetingData.activeVolunteers.push(volunteer);

        console.log('Volunteer signed in:', volunteer.fullName, 'Service:', volunteer.serviceType);

        // Broadcast to all clients
        io.emit('sync-data', meetingData);
        socket.emit('signin-success', 'Successfully signed in for volunteer service!');
    });

    // Handle volunteer sign-out
    socket.on('volunteer-signout', (signoutData) => {
        const volunteerIndex = meetingData.activeVolunteers.findIndex(v => v.studentId === signoutData.studentId);

        if (volunteerIndex === -1) {
            socket.emit('signin-error', 'Volunteer session not found');
            return;
        }

        const volunteer = meetingData.activeVolunteers[volunteerIndex];

        // Calculate session duration
        const signInTime = new Date(volunteer.signInTime);
        const signOutTime = new Date(signoutData.signOutTime);
        const durationMinutes = Math.round((signOutTime - signInTime) / (1000 * 60));

        // Create completed session record
        const completedSession = {
            ...volunteer,
            signOutTime: signoutData.signOutTime,
            durationMinutes: durationMinutes,
            summary: signoutData.summary || '',
            sessionId: Date.now()
        };

        // Move from active to completed sessions
        meetingData.volunteerSessions.push(completedSession);
        meetingData.activeVolunteers.splice(volunteerIndex, 1);

        console.log('Volunteer signed out:', volunteer.fullName, `Duration: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`);

        // Broadcast to all clients
        io.emit('sync-data', meetingData);
        socket.emit('signin-success', `Successfully signed out! Session duration: ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`);
    });

    // Handle member removal
    socket.on('remove-member', (memberId) => {
        const memberIndex = meetingData.members.findIndex(m => m.id === memberId);
        if (memberIndex !== -1) {
            const member = meetingData.members[memberIndex];
            meetingData.members.splice(memberIndex, 1);

            // Remove device from signed devices
            const deviceIndex = meetingData.signedInDevices.indexOf(member.deviceId);
            if (deviceIndex !== -1) {
                meetingData.signedInDevices.splice(deviceIndex, 1);
            }

            console.log('Member removed:', member.fullName);
            io.emit('sync-data', meetingData);
        }
    });

    // Handle clear all members
    socket.on('clear-members', () => {
        meetingData.members = [];
        meetingData.signedInDevices = [];
        console.log('All members cleared');
        io.emit('sync-data', meetingData);
    });

    // Handle clear all volunteer data
    socket.on('clear-volunteer-data', () => {
        meetingData.activeVolunteers = [];
        meetingData.volunteerSessions = [];
        console.log('All volunteer data cleared');
        io.emit('sync-data', meetingData);
        socket.emit('signin-success', 'All volunteer data cleared successfully');
    });

    // Handle reset device sign-ins
    socket.on('reset-devices', () => {
        meetingData.signedInDevices = [];
        console.log('Device sign-ins reset');
        io.emit('sync-data', meetingData);
    });

    // Handle location description updates
    socket.on('update-location-description', (data) => {
        meetingData.locationDescription = data.description;
        console.log('Location description updated:', data.description);
        io.emit('sync-data', meetingData);
    });

    // Handle clear location data
    socket.on('clear-location-data', () => {
        meetingData.members.forEach(member => {
            if (member.location) {
                delete member.location;
            }
        });
        console.log('Location data cleared from all members');
        io.emit('sync-data', meetingData);
    });

    // Handle password updates
    socket.on('update-officer-password', (data) => {
        meetingData.passwords.officer = data.password;
        console.log('Officer password updated');
        // Don't broadcast password changes for security
    });

    socket.on('update-admin-password', (data) => {
        meetingData.passwords.admin = data.password;
        console.log('Admin password updated');
        // Don't broadcast password changes for security
    });

    // Handle data backup
    socket.on('backup-data', () => {
        const backupData = {
            ...meetingData,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        socket.emit('backup-ready', {
            data: JSON.stringify(backupData, null, 2),
            filename: `CHOC_Backup_${new Date().toISOString().split('T')[0]}.json`
        });
        console.log('Backup data prepared');
    });

    // Handle data restore
    socket.on('restore-data', (data) => {
        try {
            // Validate backup data structure
            if (data.members && data.settings) {
                meetingData = { ...meetingData, ...data };
                console.log('Data restored from backup');
                io.emit('sync-data', meetingData);
                socket.emit('restore-success', 'Data restored successfully');
            } else {
                socket.emit('restore-error', 'Invalid backup file format');
            }
        } catch (error) {
            console.error('Restore error:', error);
            socket.emit('restore-error', 'Failed to restore data');
        }
    });

    // Handle system settings updates
    socket.on('update-system-settings', (data) => {
        meetingData.systemSettings = { ...meetingData.systemSettings, ...data };
        console.log('System settings updated:', data);
        io.emit('sync-data', meetingData);
    });

    // Handle member profile updates
    socket.on('update-member-profile', (data) => {
        meetingData.memberProfiles[data.studentId] = data.profile;
        console.log('Member profile updated:', data.studentId);
        io.emit('sync-data', meetingData);
    });

    // Handle blacklist updates
    socket.on('update-blacklist', (data) => {
        if (data.action === 'add') {
            meetingData.blacklistedIds.push(data.item);
            console.log('Student ID added to blacklist:', data.item.studentId);
        } else if (data.action === 'remove') {
            meetingData.blacklistedIds = meetingData.blacklistedIds.filter(
                item => item.studentId !== data.studentId
            );
            console.log('Student ID removed from blacklist:', data.studentId);
        }
        io.emit('sync-data', meetingData);
    });

    // Handle alert system events
    socket.on('new-alert', (alert) => {
        meetingData.alerts.push(alert);
        console.log('New alert created:', alert.type, '-', alert.title);
        // Broadcast alert to all admin clients
        io.emit('alert-broadcast', alert);
    });

    socket.on('acknowledge-alert', (alertId) => {
        const alert = meetingData.alerts.find(a => a.id == alertId);
        if (alert) {
            alert.acknowledged = true;
            console.log('Alert acknowledged:', alertId);
            io.emit('alert-acknowledged', alertId);
        }
    });

    socket.on('clear-all-alerts', () => {
        meetingData.alerts.forEach(alert => alert.acknowledged = true);
        console.log('All alerts cleared');
        io.emit('alerts-cleared');
    });

    socket.on('update-alert-settings', (settings) => {
        meetingData.alertSettings = { ...meetingData.alertSettings, ...settings };
        console.log('Alert settings updated:', settings);
        io.emit('sync-data', meetingData);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
    console.log(`🏥 CHOC Meeting Server running on port ${PORT}`);
    console.log('📱 All devices will sync in real-time!');
    console.log('🌐 Ready for production deployment!');

    if (process.env.NODE_ENV === 'production') {
        console.log('🚀 Running in PRODUCTION mode');
        console.log(`   Deployed on: ${HOST}:${PORT}`);
    } else {
        console.log('🔧 Running in DEVELOPMENT mode');
        console.log(`   Local access: http://localhost:${PORT}`);
    }
});