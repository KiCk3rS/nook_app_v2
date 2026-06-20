import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

import { colors } from '../../constants/theme';

import { mapSearchBarStyles } from './mapSearchBarStyles';

interface SearchHeaderProps {
  onPress?: () => void;
}

export function SearchHeader({ onPress }: SearchHeaderProps) {
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
        accessibilityLabel="Rechercher un lieu"
        accessibilityHint="Ouvre la recherche de destinations"
      >
        <TextInput
          style={mapSearchBarStyles.input}
          placeholder="Rechercher un lieu…"
          placeholderTextColor={colors.mutedSoft}
          accessibilityLabel="Rechercher un lieu"
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
