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
  SegmentedButtons,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Formik} from 'formik';
import * as Yup from 'yup';

import {RootStackParamList} from '../../navigation/AppNavigator';
import {RootState, AppDispatch} from '../../store/store';
import {
  createLead,
  updateLead,
  fetchLeadById,
  clearError,
  LeadStatus,
} from '../../store/slices/leadSlice';
import {fetchCustomers} from '../../store/slices/customerSlice';

type AddEditLeadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddEditLead'>;
type AddEditLeadScreenRouteProp = RouteProp<RootStackParamList, 'AddEditLead'>;

const leadSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .required('Description is required'),
  value: Yup.number()
    .min(0, 'Value must be positive')
    .required('Value is required'),
  customerId: Yup.string().required('Customer is required'),
});

const AddEditLeadScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<AddEditLeadScreenNavigationProp>();
  const route = useRoute<AddEditLeadScreenRouteProp>();
  const {leadId, customerId} = route.params;

  const {currentLead, loading, error} = useSelector((state: RootState) => state.leads);
  const {customers} = useSelector((state: RootState) => state.customers);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const isEditing = !!leadId;

  useEffect(() => {
    if (leadId) {
      dispatch(fetchLeadById(leadId));
    }
    if (!customers.length) {
      dispatch(fetchCustomers({page: 1}));
    }
  }, [leadId, dispatch, customers.length]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleSubmit = async (values: {
    title: string;
    description: string;
    value: number;
    customerId: string;
    status: LeadStatus;
  }) => {
    try {
      if (isEditing && leadId) {
        const result = await dispatch(updateLead({id: leadId, data: values}));
        if (updateLead.fulfilled.match(result)) {
          Alert.alert('Success', 'Lead updated successfully!', [
            {text: 'OK', onPress: () => navigation.goBack()},
          ]);
        }
      } else {
        const result = await dispatch(createLead(values));
        if (createLead.fulfilled.match(result)) {
          Alert.alert('Success', 'Lead created successfully!', [
            {text: 'OK', onPress: () => navigation.goBack()},
          ]);
        }
      }
    } catch (err) {
      console.error('Lead save error:', err);
    }
  };

  const handleSnackbarDismiss = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  if (isEditing && loading && !currentLead) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading lead...</Text>
      </View>
    );
  }

  const initialValues = {
    title: currentLead?.title || '',
    description: currentLead?.description || '',
    value: currentLead?.value || 0,
    customerId: currentLead?.customerId || customerId || '',
    status: currentLead?.status || 'New',
  };

  const statusButtons = [
    {value: 'New', label: 'New'},
    {value: 'Contacted', label: 'Contacted'},
    {value: 'Converted', label: 'Converted'},
    {value: 'Lost', label: 'Lost'},
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              {isEditing ? 'Edit Lead' : 'Add New Lead'}
            </Text>

            <Formik
              initialValues={initialValues}
              validationSchema={leadSchema}
              enableReinitialize
              onSubmit={handleSubmit}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
                isValid,
              }) => (
                <View>
                  <TextInput
                    label="Lead Title *"
                    value={values.title}
                    onChangeText={handleChange('title')}
                    onBlur={handleBlur('title')}
                    mode="outlined"
                    error={touched.title && !!errors.title}
                    style={styles.input}
                  />
                  {touched.title && errors.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}

                  <TextInput
                    label="Description *"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    error={touched.description && !!errors.description}
                    style={styles.input}
                  />
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}

                  <TextInput
                    label="Value ($) *"
                    value={values.value.toString()}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text) || 0;
                      setFieldValue('value', numValue);
                    }}
                    onBlur={handleBlur('value')}
                    mode="outlined"
                    keyboardType="numeric"
                    error={touched.value && !!errors.value}
                    style={styles.input}
                  />
                  {touched.value && errors.value && (
                    <Text style={styles.errorText}>{errors.value}</Text>
                  )}

                  {!customerId && (
                    <View style={styles.customerSection}>
                      <Text variant="bodyLarge" style={styles.sectionLabel}>
                        Select Customer *
                      </Text>
                      {customers.map((customer) => (
                        <Button
                          key={customer.id}
                          mode={values.customerId === customer.id ? 'contained' : 'outlined'}
                          onPress={() => setFieldValue('customerId', customer.id)}
                          style={styles.customerButton}>
                          {customer.name} - {customer.email}
                        </Button>
                      ))}
                      {touched.customerId && errors.customerId && (
                        <Text style={styles.errorText}>{errors.customerId}</Text>
                      )}
                    </View>
                  )}

                  <View style={styles.statusSection}>
                    <Text variant="bodyLarge" style={styles.sectionLabel}>
                      Lead Status
                    </Text>
                    <SegmentedButtons
                      value={values.status}
                      onValueChange={(value) => setFieldValue('status', value)}
                      buttons={statusButtons}
                      style={styles.segmentedButtons}
                    />
                  </View>

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
                        ? 'Update Lead'
                        : 'Create Lead'}
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
  customerSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  customerButton: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  statusSection: {
    marginBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: '#fff',
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

export default AddEditLeadScreen;
