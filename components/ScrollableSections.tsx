import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ScrollableSectionProps {
  title?: string;
  children: React.ReactNode;
  horizontal?: boolean;
  showsScrollIndicator?: boolean;
  contentContainerStyle?: any;
  onPress?: () => void;
  showMoreButton?: boolean;
  moreButtonText?: string;
}

interface ScrollableSectionsProps {
  sections: ScrollableSectionProps[];
  containerStyle?: any;
}

export function ScrollableSection({
  title,
  children,
  horizontal = false,
  showsScrollIndicator = false,
  contentContainerStyle,
  onPress,
  showMoreButton = false,
  moreButtonText = 'See All'
}: ScrollableSectionProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
    },
    moreButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.primaryContainer,
    },
    moreButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.onPrimaryContainer,
    },
    scrollContainer: {
      flex: 1,
    },
    horizontalContent: {
      paddingHorizontal: 20,
      gap: 12,
    },
    verticalContent: {
      paddingHorizontal: 20,
    },
  });

  return (
    <View style={styles.container}>
      {(title || showMoreButton) && (
        <View style={styles.header}>
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}
          {showMoreButton && (
            <TouchableOpacity style={styles.moreButton} onPress={onPress}>
              <Text style={styles.moreButtonText}>{moreButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <ScrollView
        horizontal={horizontal}
        showsHorizontalScrollIndicator={horizontal ? showsScrollIndicator : false}
        showsVerticalScrollIndicator={!horizontal ? showsScrollIndicator : false}
        contentContainerStyle={[
          horizontal ? styles.horizontalContent : styles.verticalContent,
          contentContainerStyle
        ]}
        style={styles.scrollContainer}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function ScrollableSections({ sections, containerStyle }: ScrollableSectionsProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      ...containerStyle,
    },
  });

  return (
    <View style={styles.container}>
      {sections.map((section, index) => (
        <ScrollableSection key={index} {...section} />
      ))}
    </View>
  );
}

// Horizontal scrolling card component for easy use
interface HorizontalCardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export function HorizontalCard({ children, style, onPress }: HorizontalCardProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      minWidth: 200,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  });

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent style={[styles.card, style]} onPress={onPress}>
      {children}
    </CardComponent>
  );
}

// Vertical scrolling item component
interface VerticalItemProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export function VerticalItem({ children, style, onPress }: VerticalItemProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    item: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
  });

  const ItemComponent = onPress ? TouchableOpacity : View;

  return (
    <ItemComponent style={[styles.item, style]} onPress={onPress}>
      {children}
    </ItemComponent>
  );
} 