# SymptomTracker

A comprehensive symptom tracking application built with Encore.ts and React. Track daily symptoms, identify patterns, and generate reports for better health management.

## Features

### Core Functionality
- **Daily Check-ins**: Track pain, mood, energy, and sleep quality on a 1-10 scale
- **Trigger Tracking**: Log potential triggers like stress, weather, medication, etc.
- **Pattern Analysis**: AI-powered insights to identify correlations and trends
- **Visual Dashboard**: Charts and graphs showing symptom progression over time
- **Report Generation**: Export data as CSV for healthcare providers

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Interface**: Clean, accessible design with smooth animations
- **Offline Support**: Continue tracking even without internet connection
- **Data Persistence**: Secure local storage with cloud backup options

## Tech Stack

### Backend (Encore.ts)
- **Framework**: Encore.ts for type-safe API development
- **Database**: PostgreSQL with automated migrations
- **Services**: Modular service architecture
- **Analytics**: Built-in pattern analysis algorithms

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui component library
- **Charts**: Recharts for data visualization
- **Routing**: React Router for navigation

## Project Structure

```
├── backend/
│   └── symptom/
│       ├── encore.service.ts      # Service definition
│       ├── types.ts               # Shared TypeScript types
│       ├── db.ts                  # Database configuration
│       ├── migrations/            # Database migrations
│       ├── create_user.ts         # User management
│       ├── create_entry.ts        # Symptom entry creation
│       ├── get_entries.ts         # Entry retrieval
│       ├── get_patterns.ts        # Pattern analysis
│       └── ...                    # Other API endpoints
├── frontend/
│   ├── App.tsx                    # Main application component
│   ├── components/
│   │   ├── checkin/              # Daily check-in interface
│   │   ├── dashboard/            # Main dashboard
│   │   ├── reports/              # Report generation
│   │   ├── settings/             # User preferences
│   │   └── common/               # Shared components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom React hooks
│   └── utils/                    # Utility functions
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- Encore CLI installed
- Modern web browser

### Installation
1. Clone the repository
2. Install dependencies (automatically handled by Leap)
3. Run the development server

### Usage
1. Complete the onboarding process to set up your profile
2. Start tracking symptoms with daily check-ins
3. View your progress on the dashboard
4. Generate reports for healthcare providers

## API Endpoints

### User Management
- `POST /users` - Create new user profile
- `GET /users/:id` - Get user information
- `PUT /users/:id` - Update user profile

### Symptom Tracking
- `POST /entries` - Create symptom entry
- `GET /entries` - Get symptom entries with filtering
- `PUT /entries/:id` - Update existing entry
- `DELETE /entries/:id` - Delete entry

### Analytics
- `GET /patterns` - Get pattern analysis and insights

## Database Schema

### Users Table
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `conditions` (TEXT[], health conditions being tracked)
- `check_in_time` (TEXT, preferred reminder time)
- `join_date` (TIMESTAMP)

### Symptom Entries Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `date` (DATE, entry date)
- `pain` (INTEGER 1-10)
- `mood` (INTEGER 1-10)
- `energy` (INTEGER 1-10)
- `sleep` (INTEGER 1-10)
- `notes` (TEXT, optional)
- `triggers` (TEXT[], potential triggers)
- `completed` (BOOLEAN)

## Known Issues & TODO

### High Priority
- [ ] **Authentication System**: Currently uses local storage for user management
  - Implement proper user authentication (Clerk recommended)
  - Add secure session management
  - Enable multi-user support

- [ ] **Data Backup**: No cloud backup currently implemented
  - Add automatic data synchronization
  - Implement data export/import functionality
  - Cloud storage integration

### Medium Priority
- [ ] **Enhanced Analytics**: 
  - More sophisticated pattern recognition
  - Machine learning-based predictions
  - Correlation analysis with external factors (weather, etc.)

- [ ] **Notifications**: 
  - Push notifications for check-in reminders
  - Weekly/monthly summary emails
  - Alert system for concerning patterns

- [ ] **Mobile App**: 
  - Native mobile applications
  - Offline-first architecture
  - Push notification support

### Low Priority
- [ ] **Social Features**:
  - Anonymous community insights
  - Shared pattern templates
  - Healthcare provider collaboration tools

- [ ] **Advanced Reporting**:
  - PDF report generation
  - Custom report templates
  - Integration with health platforms

- [ ] **Accessibility**:
  - Screen reader optimization
  - Keyboard navigation improvements
  - High contrast mode

## Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with proper TypeScript types
3. Test thoroughly on multiple devices
4. Submit pull request with detailed description

### Code Standards
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Ensure responsive design for all components

### Testing
- Test all API endpoints with various inputs
- Verify mobile responsiveness
- Check accessibility compliance
- Validate data persistence

## Security Considerations

### Current Limitations
- **No Authentication**: User data stored locally without encryption
- **No Authorization**: All API endpoints are publicly accessible
- **Data Privacy**: No HIPAA compliance measures implemented

### Recommended Improvements
- Implement proper authentication system
- Add data encryption at rest and in transit
- Regular security audits
- GDPR/HIPAA compliance measures

## Performance Notes

### Current Performance
- Fast local data access
- Efficient pattern analysis algorithms
- Optimized React rendering

### Potential Optimizations
- Database query optimization for large datasets
- Implement data pagination
- Add caching layers
- Optimize bundle size

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or questions:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Include steps to reproduce for bugs
4. Provide browser/device information

---

**Note**: This application is for personal health tracking and should not replace professional medical advice. Always consult healthcare providers for medical decisions.
