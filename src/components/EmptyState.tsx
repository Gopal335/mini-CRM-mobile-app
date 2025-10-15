import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button} from 'react-native-paper';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  actionText,
  onAction,
  icon = 'inbox-outline',
}) => {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
      {actionText && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.actionButton}
          icon={icon}>
          {actionText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  subtitle: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#2196F3',
  },
});

export default EmptyState;
