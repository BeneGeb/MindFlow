import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { LIBRARY_ARTICLES } from '../data/library';
import { loadContent } from '../utils/contentLoader';
import { ColorTheme, spacing, radius, typography } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

type Route = RouteProp<RootStackParamList, 'LibraryArticle'>;

export default function LibraryArticleScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { articleId } = route.params;
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const article = LIBRARY_ARTICLES.find((a) => a.id === articleId);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!article) {
      setLoading(false);
      return;
    }
    loadContent(article.assetKey).then((text) => {
      setContent(text);
      setLoading(false);
    });
  }, [article]);

  const mdStyles = makeMarkdownStyles(colors);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {article?.title ?? 'Article'}
        </Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          style={{ marginTop: spacing.xxl }}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Markdown style={mdStyles}>{content}</Markdown>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ColorTheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
});

const makeMarkdownStyles = (colors: ColorTheme) => ({
  body: { color: colors.textPrimary, fontSize: 15, lineHeight: 24 },
  heading1: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
  heading2: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.md },
  heading3: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  paragraph: { marginBottom: spacing.md, color: colors.textPrimary },
  strong: { fontWeight: '700' as const },
  em: { fontStyle: 'italic' as const, color: colors.primary },
  bullet_list: { marginBottom: spacing.md },
  list_item: { marginBottom: spacing.xs },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.md,
    marginVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  table: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, marginBottom: spacing.md },
  th: { backgroundColor: colors.primaryLight, padding: spacing.sm },
  td: { padding: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  hr: { backgroundColor: colors.border, height: 1, marginVertical: spacing.md },
  code_inline: {
    backgroundColor: colors.primaryLight,
    color: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 4,
  },
});
