import { getPlaceById } from '../../constants/mockPlaces';
import { USER_ITINERARIES_COPY } from '../../constants/userItinerariesCopy';
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
          ? { label: USER_ITINERARIES_COPY.incompleteBadge, variant: 'muted' }
          : undefined
      }
      onPress={onPress}
      disabled={incomplete}
      accessibilityLabel={`${itinerary.title}, ${meta}`}
      actionIcon="trash-outline"
      actionLabel={USER_ITINERARIES_COPY.delete}
      onAction={onDelete}
    />
  );
}
