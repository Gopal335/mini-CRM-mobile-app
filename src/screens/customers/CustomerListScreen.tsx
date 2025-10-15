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
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {RootStackParamList} from '../../navigation/AppNavigator';
import {RootState, AppDispatch} from '../../store/store';
import {
  fetchCustomers,
  deleteCustomer,
  setSearchQuery,
  setCurrentPage,
  clearError,
} from '../../store/slices/customerSlice';

type CustomerListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CustomerList'>;

const CustomerListScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CustomerListScreenNavigationProp>();
  const {
    customers,
    loading,
    error,
    totalCount,
    currentPage,
    searchQuery,
  } = useSelector((state: RootState) => state.customers);

  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [])
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadCustomers = async () => {
    await dispatch(fetchCustomers({page: currentPage, search: searchQuery}));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    dispatch(setCurrentPage(1));
    // Debounce search
    setTimeout(() => {
      dispatch(fetchCustomers({page: 1, search: query}));
    }, 500);
  };

  const handleDeleteCustomer = (customerId: string, customerName: string) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customerName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteCustomer(customerId)),
        },
      ]
    );
  };

  const handleLoadMore = () => {
    if (customers.length < totalCount && !loading) {
      const nextPage = currentPage + 1;
      dispatch(setCurrentPage(nextPage));
      dispatch(fetchCustomers({page: nextPage, search: searchQuery}));
    }
  };

  const renderCustomer = ({item}: {item: any}) => (
    <Card style={styles.customerCard}>
      <Card.Content>
        <View style={styles.customerHeader}>
          <View style={styles.customerInfo}>
            <Text variant="titleMedium" style={styles.customerName}>
              {item.name}
            </Text>
            <Text variant="bodyMedium" style={styles.customerEmail}>
              {item.email}
            </Text>
            {item.company && (
              <Text variant="bodySmall" style={styles.customerCompany}>
                {item.company}
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
                navigation.navigate('CustomerDetails', {customerId: item.id});
              }}
              title="View Details"
              leadingIcon="eye"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                navigation.navigate('AddEditCustomer', {customerId: item.id});
              }}
              title="Edit"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                handleDeleteCustomer(item.id, item.name);
              }}
              title="Delete"
              leadingIcon="delete"
            />
          </Menu>
        </View>
        <View style={styles.customerFooter}>
          <Chip icon="phone" compact style={styles.phoneChip}>
            {item.phone}
          </Chip>
          <Text variant="bodySmall" style={styles.dateText}>
            Added: {new Date(item.createdAt).toLocaleDateString()}
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
        No Customers Found
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try adjusting your search criteria'
          : 'Start by adding your first customer'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search customers by name or email..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={customers}
        renderItem={renderCustomer}
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
        onPress={() => navigation.navigate('AddEditCustomer')}
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
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  customerCard: {
    marginBottom: 12,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  customerEmail: {
    color: '#666',
    marginBottom: 2,
  },
  customerCompany: {
    color: '#999',
    fontStyle: 'italic',
  },
  customerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  phoneChip: {
    backgroundColor: '#e3f2fd',
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

export default CustomerListScreen;
