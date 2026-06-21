import { HUB_COPY } from '../../constants/hubCopy';
import type { EditorialItinerary } from '../../constants/mockItineraries';
import {
  difficultyLabels,
  formatItineraryDuration,
} from '../../constants/mockItineraries';
import { ItineraryRow } from './ItineraryRow';

interface ItineraryListRowProps {
  itinerary: EditorialItinerary;
  isLocked: boolean;
  onPress: () => void;
}

export function ItineraryListRow({ itinerary, isLocked, onPress }: ItineraryListRowProps) {
  const duration = formatItineraryDuration(itinerary.durationMinutes);
  const steps = `${itinerary.stepPoiIds.length} étapes`;

  return (
    <ItineraryRow
      title={itinerary.title}
      coverImageUrl={itinerary.coverImageUrl}
      meta={`${duration} · ${steps} · ${difficultyLabels[itinerary.difficulty]}`}
      badge={
        itinerary.isPremium
          ? { label: HUB_COPY.premiumBadge, variant: 'premium' }
          : undefined
      }
      trailing={isLocked ? 'lock' : 'chevron'}
      onPress={onPress}
      accessibilityLabel={`Itinéraire ${itinerary.title}, ${duration}, ${steps}${isLocked ? ', premium verrouillé' : ''}`}
    />
  );
}
