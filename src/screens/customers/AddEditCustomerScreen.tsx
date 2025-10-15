import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Formik} from 'formik';
import * as Yup from 'yup';

import {RootStackParamList} from '../../navigation/AppNavigator';
import {RootState, AppDispatch} from '../../store/store';
import {
  createCustomer,
  updateCustomer,
  fetchCustomerById,
  clearError,
} from '../../store/slices/customerSlice';

type AddEditCustomerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddEditCustomer'>;
type AddEditCustomerScreenRouteProp = RouteProp<RootStackParamList, 'AddEditCustomer'>;

const customerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .required('Phone number is required'),
  company: Yup.string()
    .min(2, 'Company name must be at least 2 characters'),
});

const AddEditCustomerScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<AddEditCustomerScreenNavigationProp>();
  const route = useRoute<AddEditCustomerScreenRouteProp>();
  const {customerId} = route.params;

  const {currentCustomer, loading, error} = useSelector((state: RootState) => state.customers);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const isEditing = !!customerId;

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerById(customerId));
    }
  }, [customerId, dispatch]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    company: string;
  }) => {
    try {
      if (isEditing && customerId) {
        const result = await dispatch(updateCustomer({id: customerId, data: values}));
        if (updateCustomer.fulfilled.match(result)) {
          Alert.alert('Success', 'Customer updated successfully!', [
            {text: 'OK', onPress: () => navigation.goBack()},
          ]);
        }
      } else {
        const result = await dispatch(createCustomer(values));
        if (createCustomer.fulfilled.match(result)) {
          Alert.alert('Success', 'Customer created successfully!', [
            {text: 'OK', onPress: () => navigation.goBack()},
          ]);
        }
      }
    } catch (err) {
      console.error('Customer save error:', err);
    }
  };

  const handleSnackbarDismiss = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  if (isEditing && loading && !currentCustomer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading customer...</Text>
      </View>
    );
  }

  const initialValues = {
    name: currentCustomer?.name || '',
    email: currentCustomer?.email || '',
    phone: currentCustomer?.phone || '',
    company: currentCustomer?.company || '',
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </Text>

            <Formik
              initialValues={initialValues}
              validationSchema={customerSchema}
              enableReinitialize
              onSubmit={handleSubmit}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
              }) => (
                <View>
                  <TextInput
                    label="Full Name *"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    mode="outlined"
                    error={touched.name && !!errors.name}
                    style={styles.input}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}

                  <TextInput
                    label="Email *"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={touched.email && !!errors.email}
                    style={styles.input}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <TextInput
                    label="Phone Number *"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    mode="outlined"
                    keyboardType="phone-pad"
                    error={touched.phone && !!errors.phone}
                    style={styles.input}
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}

                  <TextInput
                    label="Company"
                    value={values.company}
                    onChangeText={handleChange('company')}
                    onBlur={handleBlur('company')}
                    mode="outlined"
                    error={touched.company && !!errors.company}
                    style={styles.input}
                  />
                  {touched.company && errors.company && (
                    <Text style={styles.errorText}>{errors.company}</Text>
                  )}

                  <View style={styles.buttonContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.goBack()}
                      style={styles.cancelButton}>
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      loading={loading}
                      disabled={loading || !isValid}
                      style={styles.saveButton}>
                      {loading
                        ? isEditing
                          ? 'Updating...'
                          : 'Creating...'
                        : isEditing
                        ? 'Update Customer'
                        : 'Create Customer'}
                    </Button>
                  </View>
                </View>
              )}
            </Formik>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={handleSnackbarDismiss}
        duration={4000}
        style={styles.snackbar}>
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    elevation: 4,
  },
  title: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  snackbar: {
    backgroundColor: '#B00020',
  },
});

export default AddEditCustomerScreen;
