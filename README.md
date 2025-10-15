# CRM Mobile Application

A comprehensive Customer Relationship Management (CRM) mobile application built with React Native, featuring user authentication, customer management, lead tracking, and analytics dashboard.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login and registration with token-based authentication
- **Customer Management**: Complete CRUD operations for customer data
- **Lead Management**: Track leads with status updates and filtering
- **Dashboard Analytics**: Visual charts and statistics for business insights
- **Search & Filtering**: Advanced search and filter capabilities
- **Pagination**: Efficient data loading with pagination support

### Technical Features
- **State Management**: Redux Toolkit for global state management
- **Form Validation**: Yup schema validation with Formik integration
- **UI Components**: React Native Paper for consistent design
- **Charts & Analytics**: React Native Chart Kit for data visualization
- **Dark/Light Mode**: Theme support with system preference detection
- **Offline Support**: AsyncStorage for data persistence
- **TypeScript**: Full TypeScript support for type safety
- **Unit Tests**: Jest and React Native Testing Library

## 📱 Screenshots

### Authentication
- Login Screen with form validation
- Registration Screen with password confirmation
- Secure token storage with AsyncStorage

### Dashboard
- Overview statistics (customers, leads, total value)
- Interactive charts (Pie chart and Bar chart)
- Lead status distribution
- Quick action buttons

### Customer Management
- Customer list with search functionality
- Add/Edit customer forms with validation
- Customer details with associated leads
- Delete confirmation dialogs

### Lead Management
- Lead list with status filtering
- Add/Edit lead forms with customer selection
- Lead status tracking (New, Contacted, Converted, Lost)
- Value tracking and analytics

## 🛠 Tech Stack

### Frontend
- **React Native** (0.72.4) - Mobile app framework
- **TypeScript** - Type safety and better development experience
- **React Navigation** (6.x) - Navigation library
- **React Native Paper** (5.x) - Material Design components
- **Redux Toolkit** - State management
- **Redux Persist** - State persistence
- **Formik** - Form handling
- **Yup** - Schema validation
- **React Native Chart Kit** - Data visualization
- **React Native Vector Icons** - Icon library

### Development Tools
- **Jest** - Testing framework
- **React Native Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Metro** - React Native bundler

### Backend (Mock)
- **JSON Server** - Mock REST API
- **AsyncStorage** - Local data persistence

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **React Native CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **Java Development Kit (JDK)** 11 or higher

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crm-mobile-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 4. Start Metro Bundler
```bash
npm start
# or
yarn start
```

### 5. Run the Application

#### Android
```bash
npm run android
# or
yarn android
```

#### iOS
```bash
npm run ios
# or
yarn ios
```

## 🔧 Configuration

### Mock API Configuration
The application uses a mock API by default. To switch to a real API:

1. Update `src/services/api.ts`
2. Set `USE_MOCK_API = false`
3. Configure your API endpoint in `BASE_URL`

### Theme Configuration
The app supports light/dark mode themes. Theme preferences are stored in AsyncStorage and can be configured in `src/contexts/ThemeContext.tsx`.

## 📱 Usage

### Authentication
1. **Login**: Use existing credentials or register a new account
2. **Registration**: Create a new account with name, email, and password
3. **Auto-login**: App remembers login state using AsyncStorage

### Customer Management
1. **View Customers**: Browse all customers with search functionality
2. **Add Customer**: Create new customer with name, email, phone, and company
3. **Edit Customer**: Update customer information
4. **Delete Customer**: Remove customer (with confirmation)
5. **Customer Details**: View detailed customer information and associated leads

### Lead Management
1. **View Leads**: Browse leads with status filtering
2. **Add Lead**: Create new lead with title, description, value, and customer
3. **Edit Lead**: Update lead information and status
4. **Delete Lead**: Remove lead (with confirmation)
5. **Status Tracking**: Track lead progress (New → Contacted → Converted/Lost)

### Dashboard
1. **Statistics**: View total customers, leads, and value
2. **Charts**: Interactive pie and bar charts for lead analytics
3. **Quick Actions**: Navigate to customer and lead management

## 🧪 Testing

### Run Tests
```bash
npm test
# or
yarn test
```

### Run Tests with Coverage
```bash
npm run test:coverage
# or
yarn test:coverage
```

### Test Structure
- Unit tests for components and utilities
- Integration tests for Redux slices
- Navigation tests for screen transitions
- Form validation tests

## 📁 Project Structure

```
src/
├── __tests__/                 # Test files
├── components/                # Reusable UI components
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── StatusChip.tsx
├── contexts/                  # React contexts
│   └── ThemeContext.tsx
├── navigation/                # Navigation configuration
│   └── AppNavigator.tsx
├── screens/                   # Screen components
│   ├── auth/                  # Authentication screens
│   ├── customers/             # Customer management screens
│   ├── leads/                 # Lead management screens
│   └── main/                  # Main app screens
├── services/                  # API and external services
│   ├── api.ts
│   └── mockApi.ts
├── store/                     # Redux store configuration
│   ├── slices/                # Redux slices
│   └── store.ts
├── theme/                     # Theme configuration
│   └── theme.ts
└── App.tsx                    # Main app component
```

## 🎨 UI/UX Features

### Design System
- **Material Design**: Consistent with Material Design guidelines
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Screen reader support and proper contrast ratios
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages and retry mechanisms

### Theme Support
- **Light Mode**: Clean, professional appearance
- **Dark Mode**: Reduced eye strain in low-light conditions
- **Auto Mode**: Follows system theme preferences
- **Customizable**: Easy to extend with custom themes

## 🔒 Security Features

### Authentication
- **Token-based Auth**: JWT-like tokens for secure authentication
- **Secure Storage**: AsyncStorage for token persistence
- **Auto-logout**: Token expiration handling
- **Input Validation**: Server-side and client-side validation

### Data Protection
- **Input Sanitization**: Prevents XSS attacks
- **Type Safety**: TypeScript prevents runtime errors
- **Error Boundaries**: Graceful error handling

## 🚀 Deployment

### Android
1. Generate signed APK:
```bash
cd android
./gradlew assembleRelease
```

2. Build AAB for Play Store:
```bash
./gradlew bundleRelease
```

### iOS
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Team** - For the amazing framework
- **React Native Paper** - For the beautiful UI components
- **Redux Team** - For the state management solution
- **React Navigation** - For the navigation library
- **Chart Kit** - For the chart components

## 📞 Support

For support, email support@example.com or create an issue in the repository.

---

**Built with ❤️ using React Native**
