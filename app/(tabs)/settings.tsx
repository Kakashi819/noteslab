import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, Smartphone, Palette, Info } from 'lucide-react-native';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();

  const themeOptions: { mode: ThemeMode; title: string; icon: any }[] = [
    { mode: 'light', title: 'Light', icon: Sun },
    { mode: 'dark', title: 'Dark', icon: Moon },
    { mode: 'system', title: 'System', icon: Smartphone },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    title: {
      fontSize: 32,
      fontFamily: 'Inter-Bold',
      color: theme.onSurface,
    },
    content: {
      flex: 1,
    },
    section: {
      marginVertical: 8,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurfaceVariant,
      paddingHorizontal: 20,
      paddingVertical: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    settingItem: {
      backgroundColor: theme.surface,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    settingItemBorder: {
      borderTopWidth: 1,
      borderTopColor: theme.outlineVariant,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
    },
    settingDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
      marginTop: 2,
    },
    themeSelector: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.outlineVariant,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    themeOptionActive: {
      backgroundColor: theme.primaryContainer,
      borderColor: theme.primary,
    },
    themeOptionText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.onSurfaceVariant,
    },
    themeOptionTextActive: {
      color: theme.onPrimaryContainer,
    },
    appInfo: {
      padding: 20,
      alignItems: 'center',
      gap: 8,
    },
    appName: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.onSurface,
    },
    appVersion: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Palette size={20} color={theme.onPrimaryContainer} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingDescription}>Choose your preferred theme</Text>
              <View style={styles.themeSelector}>
                {themeOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isActive = themeMode === option.mode;
                  return (
                    <TouchableOpacity
                      key={option.mode}
                      style={[
                        styles.themeOption,
                        isActive && styles.themeOptionActive,
                      ]}
                      onPress={() => setThemeMode(option.mode)}
                    >
                      <IconComponent 
                        size={14} 
                        color={isActive ? theme.onPrimaryContainer : theme.onSurfaceVariant} 
                      />
                      <Text 
                        style={[
                          styles.themeOptionText,
                          isActive && styles.themeOptionTextActive,
                        ]}
                      >
                        {option.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={[styles.settingItem, styles.settingItemBorder]}>
            <View style={styles.settingIcon}>
              <Info size={20} color={theme.onPrimaryContainer} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>App Information</Text>
              <Text style={styles.settingDescription}>Notes app with infinite canvas</Text>
            </View>
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName}>Samsung Notes Clone</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}