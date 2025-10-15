import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {RootState} from '../store/store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main App Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerDetailsScreen from '../screens/customers/CustomerDetailsScreen';
import AddEditCustomerScreen from '../screens/customers/AddEditCustomerScreen';
import LeadListScreen from '../screens/leads/LeadListScreen';
import AddEditLeadScreen from '../screens/leads/AddEditLeadScreen';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  
  // Main
  Dashboard: undefined;
  CustomerList: undefined;
  CustomerDetails: {customerId: string};
  AddEditCustomer: {customerId?: string};
  LeadList: {customerId?: string};
  AddEditLead: {leadId?: string; customerId?: string};
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{title: 'Create Account'}}
          />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{title: 'CRM Dashboard'}}
          />
          <Stack.Screen 
            name="CustomerList" 
            component={CustomerListScreen}
            options={{title: 'Customers'}}
          />
          <Stack.Screen 
            name="CustomerDetails" 
            component={CustomerDetailsScreen}
            options={{title: 'Customer Details'}}
          />
          <Stack.Screen 
            name="AddEditCustomer" 
            component={AddEditCustomerScreen}
            options={({route}) => ({
              title: route.params?.customerId ? 'Edit Customer' : 'Add Customer',
            })}
          />
          <Stack.Screen 
            name="LeadList" 
            component={LeadListScreen}
            options={{title: 'Leads'}}
          />
          <Stack.Screen 
            name="AddEditLead" 
            component={AddEditLeadScreen}
            options={({route}) => ({
              title: route.params?.leadId ? 'Edit Lead' : 'Add Lead',
            })}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
