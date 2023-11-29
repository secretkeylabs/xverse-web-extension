import { describe, expect, test } from 'vitest';
import { ApiBundle, Bundle, mapRareSatsAPIResponseToRareSats } from './rareSats';

describe('rareSats', () => {
  describe('mapRareSatsAPIResponseToRareSats', () => {
    const testCases: Array<{ name: string; input: ApiBundle; expected: Bundle }> = [
      {
        name: 'mixed (sats, inscriptions)',
        input: {
          txid: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262e',
          vout: 0,
          block_height: 803440,
          value: 600,
          sats: [
            {
              number: '32234503563456',
              offset: 0,
              rarity_ranking: 'epic',
            },
            {
              number: '0',
              offset: 100,
              rarity_ranking: 'mythic',
            },
          ],
          inscriptions: [
            {
              id: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262ei0',
              offset: 0,
              content_type: 'image/jpeg',
            },
            {
              id: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262ei1',
              offset: 500,
              content_type: 'text/html',
            },
          ],
        },
        expected: {
          txid: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262e',
          vout: 0,
          block_height: 803440,
          value: 600,
          items: [
            {
              inscription: {
                content_type: 'text/html',
                id: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262ei1',
              },
              rarity_ranking: 'common',
              type: 'inscription',
            },
            {
              inscription: {
                content_type: 'image/jpeg',
                id: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262ei0',
              },
              rarity_ranking: 'epic',
              type: 'inscribed-sat',
              number: '32234503563456',
            },
            {
              number: '0',
              rarity_ranking: 'mythic',
              type: 'rare-sat',
            },
          ],
        },
      },
      {
        name: 'only rare sats',
        input: {
          txid: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262e',
          vout: 0,
          block_height: 803440,
          value: 600,
          sats: [
            {
              number: '32234503563456',
              offset: 0,
              rarity_ranking: 'epic',
            },
            {
              number: '0',
              offset: 100,
              rarity_ranking: 'mythic',
            },
          ],
          inscriptions: [],
        },
        expected: {
          txid: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262e',
          vout: 0,
          block_height: 803440,
          value: 600,
          items: [
            {
              number: '32234503563456',
              rarity_ranking: 'epic',
              type: 'rare-sat',
            },
            {
              number: '0',
              rarity_ranking: 'mythic',
              type: 'rare-sat',
            },
          ],
        },
      },
      {
        name: 'only inscriptions',
        input: {
          txid: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262e',
          vout: 0,
          block_height: 803440,
          value: 600,
          sats: [],
          inscriptions: [
            {
              id: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262ei0',
              offset: 0,
              content_type: 'image/jpeg',
            },
            {
              id: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262ei1',
              offset: 500,
              content_type: 'text/html',
            },
          ],
        },
        expected: {
          txid: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262e',
          vout: 0,
          block_height: 803440,
          value: 600,
          items: [
            {
              inscription: {
                content_type: 'image/jpeg',
                id: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262ei0',
              },
              rarity_ranking: 'common',
              type: 'inscription',
            },
            {
              inscription: {
                content_type: 'text/html',
                id: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262ei1',
              },
              rarity_ranking: 'common',
              type: 'inscription',
            },
          ],
        },
      },
      {
        name: 'unknown',
        input: {
          txid: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262e',
          vout: 0,
          block_height: 803440,
          value: 600,
          sats: [],
          inscriptions: [],
        },
        expected: {
          txid: '10f78695a5f83dc2c508fffceb479e49423cf5d538c680864e56c0020c7f262e',
          vout: 0,
          block_height: 803440,
          value: 600,
          items: [
            {
              type: 'unknown',
              rarity_ranking: 'unknown',
            },
          ],
        },
      },
    ];

    testCases.forEach(({ name, input, expected }) => {
      test(name, () => {
        expect(mapRareSatsAPIResponseToRareSats(input)).toEqual(expected);
      });
    });
  });
});
