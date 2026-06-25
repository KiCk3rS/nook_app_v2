import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { colors } from '../../constants/theme';

import { mapSearchBarStyles } from './mapSearchBarStyles';

interface SearchHeaderProps {
  onPress?: () => void;
}

export function SearchHeader({ onPress }: SearchHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <View style={mapSearchBarStyles.container}>
      <Pressable
        style={({ pressed }) => [
          mapSearchBarStyles.bar,
          pressed && onPress && mapSearchBarStyles.barPressed,
        ]}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel={t('searchLabel')}
        accessibilityHint={t('searchHint')}
      >
        <TextInput
          style={mapSearchBarStyles.input}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={colors.mutedSoft}
          accessibilityLabel={t('searchLabel')}
          editable={false}
          pointerEvents="none"
        />
        <View style={mapSearchBarStyles.searchOrb} accessibilityElementsHidden>
          <Ionicons name="search" size={22} color={colors.onPrimary} />
        </View>
      </Pressable>
    </View>
  );
}
