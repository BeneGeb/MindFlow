import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';
import { colors, radius } from '../utils/theme';

import HomeScreen from '../screens/HomeScreen';
import PlannerScreen from '../screens/PlannerScreen';
import StatsScreen from '../screens/StatsScreen';
import LibraryScreen from '../screens/LibraryScreen';
import HabitDetailScreen from '../screens/HabitDetailScreen';
import LibraryArticleScreen from '../screens/LibraryArticleScreen';
import StatsDetailScreen from '../screens/StatsDetailScreen';
import CreateHabitScreen from '../screens/CreateHabitScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  HabitDetail: { habitId: string };
  LibraryArticle: { articleId: string };
  StatsDetail: { plannedId: string };
  CreateHabit: { habitId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Planner: undefined;
  Stats: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Planner: '📅',
  Stats: '📊',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Planner" component={PlannerScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
      <Stack.Screen name="LibraryArticle" component={LibraryArticleScreen} />
      <Stack.Screen name="StatsDetail" component={StatsDetailScreen} />
      <Stack.Screen name="CreateHabit" component={CreateHabitScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
});
