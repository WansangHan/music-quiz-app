import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { MasteryBadge } from '../components/common/MasteryBadge';
import { TopicCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '../constants/topicCategory';
import { Colors } from '../constants/colors';
import { FontSize, Spacing, BorderRadius } from '../constants/spacing';
import { Routes } from '../constants/routes';
import { getTopicsByCategory } from '../data/topics';
import { getProgress } from '../db/progressRepository';
import { MasteryLevel } from '../types/progress';
import { TopicData } from '../types/topic';

const CATEGORIES = Object.values(TopicCategory);

interface TopicWithProgress {
  topic: TopicData;
  masteryLevel: MasteryLevel;
}

export function CategoryScreen() {
  const navigation = useNavigation<any>();
  const [expanded, setExpanded] = useState<TopicCategory | null>(null);
  const [topicsMap, setTopicsMap] = useState<Record<string, TopicWithProgress[]>>({});

  useFocusEffect(
    useCallback(() => {
      if (expanded) loadCategory(expanded);
    }, [expanded]),
  );

  const loadCategory = async (category: TopicCategory) => {
    const topics = getTopicsByCategory(category);
    const withProgress: TopicWithProgress[] = [];
    for (const topic of topics.slice(0, 50)) {
      const p = await getProgress(topic.id);
      withProgress.push({
        topic,
        masteryLevel: p?.masteryLevel ?? MasteryLevel.New,
      });
    }
    setTopicsMap((prev) => ({ ...prev, [category]: withProgress }));
  };

  const toggleCategory = (category: TopicCategory) => {
    if (expanded === category) {
      setExpanded(null);
    } else {
      setExpanded(category);
      if (!topicsMap[category]) loadCategory(category);
    }
  };

  return (
    <ScreenWrapper noPadding>
      <View style={styles.header}>
        <Text style={styles.title}>탐색</Text>
      </View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item: category }) => {
          const isExpanded = expanded === category;
          const icon = CATEGORY_ICONS[category] as any;
          const count = getTopicsByCategory(category).length;

          return (
            <View>
              <Pressable style={styles.categoryRow} onPress={() => toggleCategory(category)}>
                <Ionicons name={icon} size={22} color={Colors.category[category]} />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{CATEGORY_LABELS[category]}</Text>
                  <Text style={styles.categoryCount}>{count}개</Text>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.textLight}
                />
              </Pressable>
              {isExpanded && topicsMap[category] && (
                <View style={styles.topicList}>
                  {topicsMap[category].map((tp) => (
                    <Pressable
                      key={tp.topic.id}
                      style={styles.topicRow}
                      onPress={() => navigation.navigate(Routes.TopicDetail, { topicId: tp.topic.id })}
                    >
                      <Text style={styles.topicName} numberOfLines={1}>{tp.topic.displayName}</Text>
                      <MasteryBadge level={tp.masteryLevel} />
                    </Pressable>
                  ))}
                  {getTopicsByCategory(category).length > 50 && (
                    <Text style={styles.moreText}>...외 {getTopicsByCategory(category).length - 50}개</Text>
                  )}
                </View>
              )}
            </View>
          );
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.text,
  },
  list: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryCount: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  topicList: {
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topicName: {
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  moreText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
});
