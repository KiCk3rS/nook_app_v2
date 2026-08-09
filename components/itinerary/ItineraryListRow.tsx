import { useTranslation } from 'react-i18next';

import type { EditorialItinerary } from '../../types/api';
import {
  formatItineraryDuration,
  getItineraryDifficultyLabel,
} from '../../constants/mockItineraries';
import { formatItineraryStepMeta } from '../../lib/i18n/formatters';
import { editorialStepCount } from '../../lib/mappers/editorialItineraries';
import { ItineraryRow } from './ItineraryRow';

interface ItineraryListRowProps {
  itinerary: EditorialItinerary;
  isLocked: boolean;
  onPress: () => void;
}

export function ItineraryListRow({ itinerary, isLocked, onPress }: ItineraryListRowProps) {
  const { t } = useTranslation('hub');
  const duration = formatItineraryDuration(itinerary.durationMinutes);
  const stepsMeta = formatItineraryStepMeta(
    duration,
    editorialStepCount(itinerary),
  );

  return (
    <ItineraryRow
      title={itinerary.title}
      coverImageUrl={itinerary.coverImageUrl}
      meta={`${stepsMeta} · ${getItineraryDifficultyLabel(itinerary.difficulty)}`}
      badge={
        itinerary.isPremium
          ? { label: t('premiumBadge'), variant: 'premium' }
          : undefined
      }
      trailing={isLocked ? 'lock' : 'chevron'}
      onPress={onPress}
      accessibilityLabel={t('a11yItineraryRow', {
        title: itinerary.title,
        meta: stepsMeta,
        lockedSuffix: isLocked ? t('a11yItineraryRowLocked') : '',
      })}
    />
  );
}
