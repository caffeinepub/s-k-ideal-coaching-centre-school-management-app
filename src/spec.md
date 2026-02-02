# S.K Ideal Coaching Centre School Management App

A comprehensive school management system for administrators and teachers to manage students, fees, attendance, staff, and report cards with role-based access control. Available as a Progressive Web App (PWA) and packaged as a native Android application (APK).

## Progressive Web App (PWA) Features
- Automatic installation prompt appears when PWA criteria are met
- App name: "S.K Ideal Coaching Centre"
- Standalone display mode for native app-like experience
- Service worker caches essential assets for offline access
- Installable on desktop and mobile devices through browser install prompts
- Manifest.json with proper icon set and PWA configuration

## Native Android Application (APK)
- Web app wrapper using Capacitor configuration for native Android packaging
- Preserves all existing PWA functionality including offline capabilities
- Maintains service worker and manifest.json assets
- Push notification support for automatic install prompts
- Native Android app icon matching "S.K Ideal Coaching Centre" branding
- Custom splash screen with app name and branding
- APK file ready for direct installation on Android devices
- Native app experience with proper Android integration
- Offline functionality preserved from PWA implementation

## Authentication
- Admin login using Internet Identity
- Teacher login using username/password credentials or Internet Identity
- Only authenticated users can access the system based on their role
- Secure password storage with hashing for teacher accounts
- Teacher login system fully integrated with PWA installation flow
- Robust actor initialization and connection verification before authentication attempts
- Proper error handling for backend communication failures during login
- User-friendly error messages when actor is not available or authentication fails
- Automatic retry mechanisms for actor connection issues
- Graceful fallback handling when Internet Identity or teacher credential flows fail

## User Management
- Admin can create and manage teacher accounts with unique ID and password
- Role-based access control (Admin vs Teacher permissions)
- Teacher account creation, editing, and deletion by admin

## Student Management
- Add new students with profile information including:
  - Name, class, parent contact information, admission status, optional photo upload
- Edit existing student profiles (admin and teachers)
- View all student profiles (admin and teachers)
- Filter students by class
- Delete students with confirmation prompt (admin-only)
- Upload student photos using secure blob storage with unique file names
- Display student photos as avatars in lists and full-size in detail views

## Fee Management
- Define fee structures for different classes (admin-only)
- Generate payment records for students (admin-only)
- Mark fees as paid or unpaid (admin and teachers)
- Track payment history (admin and teachers)
- Filter fee records by class or individual student
- View outstanding payments
- Edit existing fee records with updated student ID, class ID, amount, and payment status (admin and teachers)
- All monetary values displayed in Indian Rupees (₹) with proper INR formatting conventions

## Attendance System
- Teachers and admin can mark daily attendance for students
- View attendance history for individual students
- Track attendance by class and date
- Generate attendance reports
- Display monthly attendance summaries for year 2026 showing present/absent days per month
- Filter attendance by student and month navigation for 2026

## Report Card Management
- Teachers and admin can create new report cards for students
- Edit existing report cards (teachers and admin)
- View all report cards (authenticated users)
- Each report card includes:
  - Subject-wise marks
  - Total marks
  - Grade
  - Teacher remarks
  - Evaluation date
- Filter report cards by student or class
- Display report cards in colorful, high-graphics layout with clear marks and remarks presentation

## Teacher Management
- Add new teacher profiles including:
  - Name, subject specialization, assigned classes (admin-only)
- Update existing teacher information (admin-only)
- View all teacher profiles (admin-only)
- Assign teachers to specific classes (admin-only)

## Admin Dashboard
- Display key metrics:
  - Total number of students
  - Total fees collected (displayed in Indian Rupees with ₹ symbol)
  - Attendance statistics
- Overview of recent activities
- Quick access to all management sections

## Backend Data Storage
The backend stores:
- Student profiles and admission records including optional photo URLs
- Fee structures and payment records
- Daily attendance data
- Teacher profiles and class assignments
- Teacher account credentials (hashed passwords)
- User roles and permissions
- Admin authentication data
- Report card records with student and teacher associations

## Backend Operations
- CRUD operations for students, teachers, fee records, and report cards
- Student photo URL storage and retrieval
- Teacher account creation and management by admin
- Password hashing and verification for teacher login
- Role-based permission checking for all operations
- Delete student records from storage (admin-only)
- Update existing fee records with new details (admin and teachers)
- Attendance marking and retrieval (admin and teachers)
- Group attendance data by month for 2026 summaries
- Payment status updates (admin and teachers)
- Dashboard metrics calculation
- User authentication verification for both admin and teachers
- Report card creation and updates with authorization checks
- Report card retrieval filtered by student, teacher, or class
- Actor availability verification and health check endpoints
- Robust error handling for all backend operations with proper error codes and messages
- Connection status monitoring and recovery mechanisms
- Proper initialization sequence for backend services

## Frontend Features
- Clean, professional interface styled with Tailwind CSS featuring high-quality, visually rich graphics throughout the UI
- Premium visual design with gradient effects, shadows, and smooth animations on buttons, cards, and navigation bars
- Hero banners using brand imagery (school-building, student-avatar, teacher-avatar) as background elements for Dashboard, Students, and Teachers pages
- Subtle transitions for modals and hover states creating a premium, high-definition visual look
- Performance-optimized rendering with modern CSS features
- Responsive design for desktop, tablet, and mobile use with all assets optimized for different screen sizes
- PWA installation prompt with automatic detection
- Service worker implementation for offline functionality
- Manifest.json configuration for standalone app experience
- Capacitor configuration for native Android APK packaging
- Native Android app icons and splash screen integration
- Login modal for teacher credentials with username/password form
- Error handling and display for invalid login attempts
- Role-based UI rendering based on user permissions
- Intuitive navigation between different management sections with enhanced visual styling
- Form validation for data entry
- Search and filter capabilities
- Data tables for viewing records with improved visual presentation
- Delete buttons on student rows with confirmation prompts (admin-only)
- Edit buttons on fee record rows to modify existing fee details (admin and teachers)
- Modal or inline forms for editing fee information with enhanced styling
- Monthly attendance summary view for 2026 with student and month filters
- Currency formatting using Indian Rupee (₹) symbol with standard INR formatting conventions (e.g., 1,00,000 instead of 100,000)
- All fee-related components display amounts in INR format
- Automatic refresh of records after updates using React Query refetch
- App content in English language
- PWA-compatible teacher login flow for installed app usage
- Footer displays "TixtedEdits" text centered with enlarged, prominent cursive font styling (smooth, elegant cursive or handwritten style), maintaining visual balance and classy design across both light and dark modes, with proper font scaling and padding adjustments to ensure centered alignment and aesthetic consistency across all devices and screen sizes
- Student photo upload functionality in Add Student modal using blob-storage component
- Image preview before upload in Add Student form
- Student photo display as small avatars in student lists
- Full-size student photo display in student detail and edit views
- Secure blob URL handling for uploaded student photos
- Report Cards tab accessible to teachers and admins from dashboard
- Add new report card functionality with form for subject marks, grades, and remarks
- Edit existing report cards with pre-populated data
- Filter report cards by student or class
- Colorful, high-graphics display of report cards with clear presentation of marks and teacher remarks
- Actor initialization verification before any backend calls
- Connection status indicators and loading states during actor setup
- Comprehensive error handling for "Actor not available" and "Failed to Load Profile" scenarios
- User-friendly error messages with retry options for backend communication failures
- Proper actor instance storage and retrieval in authentication flows
- End-to-end testing validation for login, profile fetch, and dashboard loading sequences
- Graceful degradation when backend services are temporarily unavailable
- Clear feedback to users during authentication and profile loading phases

## Modal Dialog Styling Requirements
- All modal dialogs across the entire application must have solid, opaque backgrounds with no transparency
- Modal backgrounds should be solid white in light mode and solid dark gray in dark mode
- Apply premium, high-graphics design with smooth shadow effects and proper border-radius for modern appearance
- Ensure complete visual separation from dashboard background with no background bleed or transparency issues
- Maintain readability and visual harmony across both light and dark modes
- Use premium styling consistent with the app's overall theme including gradient accents where appropriate
- All modals should have proper z-index layering and clear visual boundaries
- Semi-transparent backdrop overlay that darkens the rest of the dashboard when modal is open
- Consistent styling applied to all modal dialogs including:
  - Add/Edit Student modals
  - Add/Edit Teacher modals
  - Add/Edit Fee modals
  - Attendance modals
  - Report Card modals
  - Profile modals
  - Any other modal dialogs throughout the application

## Fee Management Section Styling Requirements
- Fee Management (FeesSection) must have completely solid, opaque backgrounds for all modals and detail boxes with zero transparency
- All fee-related modals (Add Fee, Edit Fee, View Fee Details) must use fully solid backgrounds - solid white in light mode and solid dark gray in dark mode
- Fee records section must display with premium, high-graphics design featuring:
  - Solid backgrounds with no translucency
  - Subtle shadow effects for depth and visual appeal
  - Smooth gradient effects consistent with the app's premium theme
  - Proper border-radius for modern appearance
- Comprehensive verification that all FeesSection modals and forms display correctly with no translucency or overlapping artifacts
- Visual consistency with the rest of the high-graphics interface throughout the Fee Management section
- Ensure complete visual separation from dashboard background with no background bleed
- Maintain readability and visual harmony across both light and dark modes in all fee-related components

## Students Section Details Panel Styling
- Student details panel must have solid, opaque background that is visually distinct from the dashboard
- Background should be solid white in light mode and solid dark gray in dark mode with no transparency
- Apply classy, high-graphics design with smooth shadow effects and proper border-radius for modern appearance
- Ensure complete visual separation from dashboard background with no background bleed
- Maintain readability and visual harmony across both light and dark modes
- Use premium styling consistent with the app's overall theme including gradient accents where appropriate
- Details panel should have proper z-index layering and clear visual boundaries

## UI Quality Assurance Requirements
- Perform comprehensive validation of all UI components to eliminate transparency, layering, or overlapping issues
- Ensure all sections and modals render cleanly without graphical glitches
- Guarantee smooth interface operation across all features and sections
- Validate visual consistency across light and dark modes
- Ensure proper backdrop overlays and z-index management for all modal dialogs
- Test all interactive elements for proper visual feedback and styling
- Special focus on Fee Management section to verify complete elimination of transparency issues

## Error Handling and Loading States
- Error boundaries in App.tsx and Dashboard.tsx to catch rendering errors and display user-friendly fallback UI
- React Query hooks properly handle loading and error states when fetching data after authentication
- Loading spinner or "Loading dashboard..." message displayed during data fetch operations with enhanced visual styling
- Clear error messages shown when any query fails
- Console logging of errors for debugging purposes instead of silent failures
- Graceful handling of authentication state changes and data loading transitions
- Specific error handling for actor initialization failures with retry mechanisms
- User-friendly messages for backend connectivity issues during login and profile loading
- Comprehensive error recovery flows for authentication and data fetching operations
- Proper error state management throughout the application lifecycle
