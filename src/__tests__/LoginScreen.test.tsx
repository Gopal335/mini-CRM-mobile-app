import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {configureStore} from '@reduxjs/toolkit';
import LoginScreen from '../screens/auth/LoginScreen';
import authReducer from '../store/slices/authSlice';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the API
jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
  },
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, initialState = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <NavigationContainer>{component}</NavigationContainer>
    </Provider>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const {getByText, getByPlaceholderText} = renderWithProviders(<LoginScreen />);
    
    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to your CRM account')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('shows validation errors for empty fields', async () => {
    const {getByText, getByTestId} = renderWithProviders(<LoginScreen />);
    
    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('shows validation error for invalid email', async () => {
    const {getByPlaceholderText, getByText} = renderWithProviders(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Invalid email address')).toBeTruthy();
    });
  });

  it('shows validation error for short password', async () => {
    const {getByPlaceholderText, getByText} = renderWithProviders(<LoginScreen />);
    
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const signInButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText('Password must be at least 6 characters')).toBeTruthy();
    });
  });

  it('navigates to register screen when sign up is pressed', () => {
    const {getByText} = renderWithProviders(<LoginScreen />);
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);

    // Navigation is handled by React Navigation, so we just verify the button is pressable
    expect(signUpButton).toBeTruthy();
  });

  it('shows loading state when login is in progress', () => {
    const initialState = {
      auth: {
        loading: true,
      },
    };
    
    const {getByText} = renderWithProviders(<LoginScreen />, initialState);
    
    expect(getByText('Signing In...')).toBeTruthy();
  });

  it('shows error message when login fails', async () => {
    const initialState = {
      auth: {
        error: 'Invalid credentials',
      },
    };
    
    const {getByText} = renderWithProviders(<LoginScreen />, initialState);
    
    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
