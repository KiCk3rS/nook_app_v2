import type { TranscriptSegment } from '../types/api';

/** Segments horodatés mock — alignés sur la démo audio (~3 min). */
export const MOCK_GUIDE_TRANSCRIPTS: Record<string, TranscriptSegment[]> = {
  '1-a': [
    {
      id: '1-a-1',
      startMs: 0,
      endMs: 12_000,
      text: 'Bienvenue devant Notre-Dame de Paris, chef-d’œuvre de l’architecture gothique au cœur de l’Île de la Cité.',
    },
    {
      id: '1-a-2',
      startMs: 12_000,
      endMs: 24_000,
      text: 'Commencée au XIIe siècle, la cathédrale a été édifiée sur plusieurs générations de bâtisseurs et de maîtres d’œuvre.',
    },
    {
      id: '1-a-3',
      startMs: 24_000,
      endMs: 38_000,
      text: 'Sa façade occidentale, avec ses trois portails sculptés, accueillait les pèlerins et les fidèles venus de toute la chrétienté.',
    },
    {
      id: '1-a-4',
      startMs: 38_000,
      endMs: 52_000,
      text: 'Le grand rosace, au-dessus du portail central, laisse filtrer une lumière changeante qui colore l’intérieur de la nef.',
    },
    {
      id: '1-a-5',
      startMs: 52_000,
      endMs: 66_000,
      text: 'Les gargouilles et chimères, perchées en hauteur, servaient autant d’évacuation des eaux de pluie que d’effet dramatique.',
    },
    {
      id: '1-a-6',
      startMs: 66_000,
      endMs: 80_000,
      text: 'À l’intérieur, les voûtes en croisée d’ogives libèrent l’espace et orientent le regard vers le chœur.',
    },
    {
      id: '1-a-7',
      startMs: 80_000,
      endMs: 95_000,
      text: 'L’incendie d’avril 2019 a profondément marqué le monument, mais le chantier de restauration progresse pas à pas.',
    },
    {
      id: '1-a-8',
      startMs: 95_000,
      endMs: 110_000,
      text: 'Prenez le temps d’observer les détails de la pierre : chaque statue raconte une scène biblique ou un saint du calendrier.',
    },
    {
      id: '1-a-9',
      startMs: 110_000,
      endMs: 125_000,
      text: 'Depuis le parvis, la cathédrale dialogue avec la Seine et le quartier latin, témoin de huit siècles d’histoire parisienne.',
    },
    {
      id: '1-a-10',
      startMs: 125_000,
      endMs: 140_000,
      text: 'Notre-Dame reste un symbole universel : un lieu de mémoire, de recueillement et de renaissance pour Paris et au-delà.',
    },
  ],
  '2-a': [
    {
      id: '2-a-1',
      startMs: 0,
      endMs: 14_000,
      text: 'Vous entrez dans l’histoire du Musée du Louvre, ancien palais royal devenu l’un des plus grands musées du monde.',
    },
    {
      id: '2-a-2',
      startMs: 14_000,
      endMs: 28_000,
      text: 'La forteresse médiévale de Philippe Auguste a laissé place, au fil des siècles, à un vaste palais des rois de France.',
    },
    {
      id: '2-a-3',
      startMs: 28_000,
      endMs: 42_000,
      text: 'Sous la Révolution, le Louvre s’ouvre au public : les collections nationales y sont progressivement rassemblées.',
    },
    {
      id: '2-a-4',
      startMs: 42_000,
      endMs: 58_000,
      text: 'La pyramide de verre, inaugurée en 1989, marque l’entrée principale et dialogue avec la façade classique du palais.',
    },
    {
      id: '2-a-5',
      startMs: 58_000,
      endMs: 74_000,
      text: 'Des antiquités égyptiennes aux chefs-d’œuvre de la Renaissance, chaque aile propose un voyage à travers le temps.',
    },
    {
      id: '2-a-6',
      startMs: 74_000,
      endMs: 90_000,
      text: 'La Joconde, la Vénus de Milo ou la Victoire de Samothrace comptent parmi les icônes que des millions de visiteurs viennent admirer.',
    },
    {
      id: '2-a-7',
      startMs: 90_000,
      endMs: 105_000,
      text: 'Le Louvre n’est pas seulement un musée : c’est un lieu où l’architecture, la royauté et l’art se superposent.',
    },
    {
      id: '2-a-8',
      startMs: 105_000,
      endMs: 120_000,
      text: 'Laissez-vous guider salle par salle — et n’hésitez pas à lever les yeux vers les plafonds souvent oubliés.',
    },
  ],
};
