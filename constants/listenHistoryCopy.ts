export const LISTEN_HISTORY_COPY = {
  title: "Historique d'écoute",
  emptyTitle: 'Aucune écoute pour l\'instant',
  emptyBody:
    'Vos guides audio écoutés apparaîtront ici. Explorez la carte pour découvrir un lieu.',
  emptyExplore: 'Explorer la carte',
  emptyDiscover: 'Découvrir des lieux',
  loadError: 'Impossible de charger votre historique.',
  retry: 'Réessayer',
  completed: 'Terminé',
  resume: 'Reprendre',
  progress: (percent: number) => `${percent} % écouté`,
  sections: {
    today: "Aujourd'hui",
    yesterday: 'Hier',
    thisWeek: 'Cette semaine',
    earlier: 'Plus tôt',
  },
} as const;
