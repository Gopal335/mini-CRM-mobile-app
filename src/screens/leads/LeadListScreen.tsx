import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  Searchbar,
  ActivityIndicator,
  IconButton,
  Menu,
  Chip,
  SegmentedButtons,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useRoute, useFocusEffect, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootStackParamList} from '../../navigation/AppNavigator';
import {RootState, AppDispatch} from '../../store/store';
import {
  fetchLeads,
  deleteLead,
  setStatusFilter,
  setCurrentPage,
  clearError,
  LeadStatus,
} from '../../store/slices/leadSlice';
import {fetchCustomers} from '../../store/slices/customerSlice';

type LeadListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LeadList'>;
type LeadListScreenRouteProp = RouteProp<RootStackParamList, 'LeadList'>;

const LeadListScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LeadListScreenNavigationProp>();
  const route = useRoute<LeadListScreenRouteProp>();
  const {customerId} = route.params || {};

  const {leads, loading, error, totalCount, currentPage, statusFilter} = useSelector(
    (state: RootState) => state.leads
  );
  const {customers} = useSelector((state: RootState) => state.customers);

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadLeads();
    }, [])
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadLeads = async () => {
    const params: any = {
      page: currentPage,
      status: statusFilter === 'All' ? undefined : statusFilter,
    };
    if (customerId) {
      params.customerId = customerId;
    }
    await dispatch(fetchLeads(params));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality if needed
  };

  const handleStatusFilter = (status: LeadStatus | 'All') => {
    dispatch(setStatusFilter(status));
    dispatch(setCurrentPage(1));
    // Reload leads with new filter
    setTimeout(() => {
      const params: any = {
        page: 1,
        status: status === 'All' ? undefined : status,
      };
      if (customerId) {
        params.customerId = customerId;
      }
      dispatch(fetchLeads(params));
    }, 100);
  };

  const handleDeleteLead = (leadId: string, leadTitle: string) => {
    Alert.alert(
      'Delete Lead',
      `Are you sure you want to delete "${leadTitle}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteLead(leadId)),
        },
      ]
    );
  };

  const handleLoadMore = () => {
    if (leads.length < totalCount && !loading) {
      const nextPage = currentPage + 1;
      dispatch(setCurrentPage(nextPage));
      const params: any = {
        page: nextPage,
        status: statusFilter === 'All' ? undefined : statusFilter,
      };
      if (customerId) {
        params.customerId = customerId;
      }
      dispatch(fetchLeads(params));
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getStatusColor = (status: LeadStatus) => {
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

  const filteredLeads = leads.filter(lead =>
    lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLead = ({item}: {item: any}) => (
    <Card style={styles.leadCard}>
      <Card.Content>
        <View style={styles.leadHeader}>
          <View style={styles.leadInfo}>
            <Text variant="titleMedium" style={styles.leadTitle}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={styles.leadDescription} numberOfLines={2}>
              {item.description}
            </Text>
            {!customerId && (
              <Text variant="bodySmall" style={styles.customerName}>
                Customer: {getCustomerName(item.customerId)}
              </Text>
            )}
          </View>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(item.id)}
              />
            }>
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                navigation.navigate('AddEditLead', {leadId: item.id});
              }}
              title="Edit"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                handleDeleteLead(item.id, item.title);
              }}
              title="Delete"
              leadingIcon="delete"
            />
          </Menu>
        </View>
        <View style={styles.leadFooter}>
          <View style={styles.leadMeta}>
            <Chip
              style={[styles.statusChip, {backgroundColor: getStatusColor(item.status)}]}
              textStyle={styles.statusChipText}>
              {item.status}
            </Chip>
            <Text variant="bodySmall" style={styles.valueText}>
              ${item.value.toLocaleString()}
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No Leads Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try adjusting your search criteria'
          : statusFilter !== 'All'
          ? `No leads with status "${statusFilter}"`
          : 'Start by adding your first lead'}
      </Text>
    </View>
  );

  const statusButtons = [
    {value: 'All', label: 'All'},
    {value: 'New', label: 'New'},
    {value: 'Contacted', label: 'Contacted'},
    {value: 'Converted', label: 'Converted'},
    {value: 'Lost', label: 'Lost'},
  ];

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search leads by title or description..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={handleStatusFilter}
          buttons={statusButtons}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={renderLead}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditLead', {customerId})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  leadCard: {
    marginBottom: 12,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leadInfo: {
    flex: 1,
  },
  leadTitle: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  leadDescription: {
    color: '#666',
    marginBottom: 4,
  },
  customerName: {
    color: '#999',
    fontStyle: 'italic',
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  leadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 12,
  },
  valueText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  dateText: {
    color: '#999',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  emptySubtitle: {
    textAlign: 'center',
    color: '#999',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default LeadListScreen;
