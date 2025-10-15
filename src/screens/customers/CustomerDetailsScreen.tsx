import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
  Divider,
  FAB,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootStackParamList} from '../../navigation/AppNavigator';
import {RootState, AppDispatch} from '../../store/store';
import {
  fetchCustomerById,
  deleteCustomer,
  clearCurrentCustomer,
} from '../../store/slices/customerSlice';
import {fetchLeadsByCustomer} from '../../store/slices/leadSlice';

type CustomerDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CustomerDetails'>;
type CustomerDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CustomerDetails'>;

const CustomerDetailsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CustomerDetailsScreenNavigationProp>();
  const route = useRoute<CustomerDetailsScreenRouteProp>();
  const {customerId} = route.params;

  const {currentCustomer, loading, error} = useSelector((state: RootState) => state.customers);
  const {leads, loading: leadsLoading} = useSelector((state: RootState) => state.leads);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const loadCustomerData = async () => {
    await Promise.all([
      dispatch(fetchCustomerById(customerId)),
      dispatch(fetchLeadsByCustomer(customerId)),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCustomerData();
    setRefreshing(false);
  };

  const handleEdit = () => {
    navigation.navigate('AddEditCustomer', {customerId});
  };

  const handleDelete = () => {
    if (!currentCustomer) return;

    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${currentCustomer.name}? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCustomer(customerId));
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddLead = () => {
    navigation.navigate('AddEditLead', {customerId});
  };

  const handleViewLeads = () => {
    navigation.navigate('LeadList', {customerId});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return '#FF6384';
      case 'Contacted':
        return '#36A2EB';
      case 'Converted':
        return '#4BC0C0';
      case 'Lost':
        return '#9966FF';
      default:
        return '#999';
    }
  };

  const totalLeadValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;

  if (loading && !currentCustomer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading customer details...</Text>
      </View>
    );
  }

  if (!currentCustomer) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall" style={styles.errorText}>
          Customer not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {/* Customer Information */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text variant="headlineSmall" style={styles.customerName}>
                {currentCustomer.name}
              </Text>
              <View style={styles.actionButtons}>
                <Button mode="outlined" onPress={handleEdit} style={styles.editButton}>
                  Edit
                </Button>
                <Button mode="outlined" onPress={handleDelete} style={styles.deleteButton}>
                  Delete
                </Button>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Email:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {currentCustomer.email}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Phone:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {currentCustomer.phone}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Company:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {currentCustomer.company || 'N/A'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Added:
                </Text>
                <Text variant="bodyMedium" style={styles.value}>
                  {new Date(currentCustomer.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Lead Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Lead Statistics
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {leads.length}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Total Leads
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {convertedLeads}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Converted
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  ${totalLeadValue.toLocaleString()}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Total Value
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Leads */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Recent Leads
              </Text>
              <Button mode="text" onPress={handleViewLeads}>
                View All
              </Button>
            </View>

            {leadsLoading ? (
              <ActivityIndicator size="small" style={styles.leadsLoader} />
            ) : leads.length === 0 ? (
              <View style={styles.noLeadsContainer}>
                <Text variant="bodyMedium" style={styles.noLeadsText}>
                  No leads found for this customer
                </Text>
                <Button mode="contained" onPress={handleAddLead} style={styles.addLeadButton}>
                  Add First Lead
                </Button>
              </View>
            ) : (
              <View style={styles.leadsList}>
                {leads.slice(0, 5).map((lead) => (
                  <View key={lead.id} style={styles.leadItem}>
                    <View style={styles.leadInfo}>
                      <Text variant="titleSmall" style={styles.leadTitle}>
                        {lead.title}
                      </Text>
                      <Text variant="bodySmall" style={styles.leadDescription}>
                        {lead.description}
                      </Text>
                      <Text variant="bodySmall" style={styles.leadValue}>
                        Value: ${lead.value.toLocaleString()}
                      </Text>
                    </View>
                    <Chip
                      style={[styles.statusChip, {backgroundColor: getStatusColor(lead.status)}]}
                      textStyle={styles.statusChipText}>
                      {lead.status}
                    </Chip>
                  </View>
                ))}
                {leads.length > 5 && (
                  <Button mode="text" onPress={handleViewLeads} style={styles.viewMoreButton}>
                    View {leads.length - 5} more leads
                  </Button>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddLead}
        label="Add Lead"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  customerName: {
    flex: 1,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    borderColor: '#2196F3',
  },
  deleteButton: {
    borderColor: '#B00020',
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: 'right',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  leadsLoader: {
    marginVertical: 20,
  },
  noLeadsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noLeadsText: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  addLeadButton: {
    backgroundColor: '#2196F3',
  },
  leadsList: {
    gap: 12,
  },
  leadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  leadInfo: {
    flex: 1,
  },
  leadTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  leadDescription: {
    color: '#666',
    marginBottom: 4,
  },
  leadValue: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statusChip: {
    marginLeft: 12,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 12,
  },
  viewMoreButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default CustomerDetailsScreen;
