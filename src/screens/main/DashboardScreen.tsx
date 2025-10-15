import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {PieChart, BarChart} from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {RootStackParamList} from '../../navigation/AppNavigator';
import {RootState, AppDispatch} from '../../store/store';
import {fetchCustomers} from '../../store/slices/customerSlice';
import {fetchLeads, LeadStatus} from '../../store/slices/leadSlice';
import {logoutUser} from '../../store/slices/authSlice';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const screenWidth = Dimensions.get('window').width;

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const {user} = useSelector((state: RootState) => state.auth);
  const {customers, loading: customersLoading} = useSelector((state: RootState) => state.customers);
  const {leads, loading: leadsLoading} = useSelector((state: RootState) => state.leads);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      dispatch(fetchCustomers({page: 1})),
      dispatch(fetchLeads({page: 1})),
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    dispatch(logoutUser());
  };

  // Calculate lead statistics
  const leadStats = {
    total: leads.length,
    new: leads.filter(lead => lead.status === 'New').length,
    contacted: leads.filter(lead => lead.status === 'Contacted').length,
    converted: leads.filter(lead => lead.status === 'Converted').length,
    lost: leads.filter(lead => lead.status === 'Lost').length,
  };

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  // Chart data
  const pieChartData = [
    {
      name: 'New',
      population: leadStats.new,
      color: '#FF6384',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Contacted',
      population: leadStats.contacted,
      color: '#36A2EB',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Converted',
      population: leadStats.converted,
      color: '#4BC0C0',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Lost',
      population: leadStats.lost,
      color: '#9966FF',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];

  const barChartData = {
    labels: ['New', 'Contacted', 'Converted', 'Lost'],
    datasets: [
      {
        data: [leadStats.new, leadStats.contacted, leadStats.converted, leadStats.lost],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  if (customersLoading || leadsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.welcomeText}>
            Welcome back, {user?.name}!
          </Text>
          <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>
            Logout
          </Button>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {customers.length}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Customers
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {leadStats.total}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Leads
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                ${totalValue.toLocaleString()}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Value
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {leadStats.converted}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Converted
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Lead Status Overview */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Lead Status Distribution
            </Text>
            <View style={styles.statusChips}>
              <Chip style={[styles.chip, {backgroundColor: '#FF6384'}]}>
                New: {leadStats.new}
              </Chip>
              <Chip style={[styles.chip, {backgroundColor: '#36A2EB'}]}>
                Contacted: {leadStats.contacted}
              </Chip>
              <Chip style={[styles.chip, {backgroundColor: '#4BC0C0'}]}>
                Converted: {leadStats.converted}
              </Chip>
              <Chip style={[styles.chip, {backgroundColor: '#9966FF'}]}>
                Lost: {leadStats.lost}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Charts */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Leads by Status (Pie Chart)
            </Text>
            <PieChart
              data={pieChartData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>

        <Card style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.chartTitle}>
              Leads by Status (Bar Chart)
            </Text>
            <BarChart
              data={barChartData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={30}
            />
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.actionsTitle}>
              Quick Actions
            </Text>
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CustomerList')}
                style={styles.actionButton}>
                View Customers
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('LeadList', {})}
                style={styles.actionButton}>
                View Leads
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  logoutButton: {
    borderColor: '#2196F3',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    color: '#666',
  },
  chartCard: {
    margin: 20,
    elevation: 2,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    margin: 4,
  },
  actionsCard: {
    margin: 20,
    elevation: 2,
  },
  actionsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default DashboardScreen;
