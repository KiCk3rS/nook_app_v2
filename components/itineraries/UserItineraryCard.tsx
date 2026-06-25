import { useTranslation } from 'react-i18next';

import { getPlaceById } from '../../constants/mockPlaces';
import { formatDurationMinutes, formatStepCount } from '../../lib/userDisplay';
import type { UserItinerary } from '../../types/api';
import { ItineraryRowWithAction } from '../itinerary/ItineraryRow';

interface UserItineraryCardProps {
  itinerary: UserItinerary;
  onPress: () => void;
  onDelete: () => void;
}

function resolveCoverImageUrl(itinerary: UserItinerary): string | undefined {
  const firstPoiId = itinerary.poiIds?.[0];
  if (!firstPoiId) return undefined;
  return getPlaceById(firstPoiId)?.imageUrl;
}

export function UserItineraryCard({
  itinerary,
  onPress,
  onDelete,
}: UserItineraryCardProps) {
  const { t } = useTranslation('userItineraries');
  const stepCount = itinerary.stepCount ?? itinerary.poiIds?.length ?? 0;
  const duration = formatDurationMinutes(itinerary.estimatedDurationMinutes);
  const meta = [duration, formatStepCount(stepCount)].filter(Boolean).join(' · ');
  const incomplete = stepCount < 2;

  return (
    <ItineraryRowWithAction
      title={itinerary.title}
      coverImageUrl={resolveCoverImageUrl(itinerary)}
      meta={meta}
      badge={
        incomplete
          ? { label: t('incompleteBadge'), variant: 'muted' }
          : undefined
      }
      onPress={onPress}
      disabled={incomplete}
      accessibilityLabel={`${itinerary.title}, ${meta}`}
      actionIcon="trash-outline"
      actionLabel={t('delete')}
      onAction={onDelete}
    />
  );
}
