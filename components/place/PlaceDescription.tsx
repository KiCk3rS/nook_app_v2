import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, textStyle } from '../../constants/theme';

const COLLAPSED_LINES = 4;
const LONG_TEXT_THRESHOLD = 120;

function splitParagraphs(description: string): string[] {
  return description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function isExpandable(paragraphs: string[]): boolean {
  if (paragraphs.length > 1) return true;
  return (paragraphs[0]?.length ?? 0) > LONG_TEXT_THRESHOLD;
}

interface PlaceDescriptionProps {
  description: string;
}

export function PlaceDescription({ description }: PlaceDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = splitParagraphs(description);
  const expandable = isExpandable(paragraphs);

  if (paragraphs.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {expanded || !expandable ? (
        paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            style={[
              styles.paragraph,
              index < paragraphs.length - 1 && styles.paragraphSpacing,
            ]}
          >
            {paragraph}
          </Text>
        ))
      ) : paragraphs.length > 1 ? (
        <Text style={styles.paragraph}>{paragraphs[0]}</Text>
      ) : (
        <Text style={styles.paragraph} numberOfLines={COLLAPSED_LINES}>
          {paragraphs[0]}
        </Text>
      )}

      {expandable ? (
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Réduire la description' : 'Lire la suite'}
        >
          <Text style={styles.toggleText}>
            {expanded ? 'Réduire' : 'Lire la suite'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  paragraph: {
    ...textStyle('bodyMd'),
    color: colors.body,
  },
  paragraphSpacing: {
    marginBottom: spacing.sm,
  },
  toggle: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  togglePressed: {
    opacity: 0.85,
  },
  toggleText: {
    ...textStyle('buttonMd'),
    color: colors.primary,
  },
});
