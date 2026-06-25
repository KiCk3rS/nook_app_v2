import { useTranslation } from 'react-i18next';

import type { EditorialItinerary } from '../../constants/mockItineraries';
import {
  difficultyLabels,
  formatItineraryDuration,
} from '../../constants/mockItineraries';
import { formatItineraryStepMeta } from '../../lib/i18n/formatters';
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
    itinerary.stepPoiIds.length,
  );

  return (
    <ItineraryRow
      title={itinerary.title}
      coverImageUrl={itinerary.coverImageUrl}
      meta={`${stepsMeta} · ${difficultyLabels[itinerary.difficulty]}`}
      badge={
        itinerary.isPremium
          ? { label: t('premiumBadge'), variant: 'premium' }
          : undefined
      }
      trailing={isLocked ? 'lock' : 'chevron'}
      onPress={onPress}
      accessibilityLabel={`Itinéraire ${itinerary.title}, ${stepsMeta}${isLocked ? ', premium verrouillé' : ''}`}
    />
  );
}
