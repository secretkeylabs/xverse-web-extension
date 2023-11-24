import { ApiBundleV2 } from '@utils/rareSats';

export type Response = {
  xVersion: number;
  limit: number;
  offset: number;
  total: number;
  results: ApiBundleV2[];
};

export const inscriptionPartOfBundle: ApiBundleV2 & { xVersion: number } = {
  block_height: 803128,
  txid: 'b8f8aee03af313ef1fbba7316aadf7390c91dc5dd34928a15f708ea4ed642852',
  value: 100,
  vout: 0,
  sat_ranges: [
    {
      year_mined: 2009,
      block: 10,
      offset: 0,
      range: {
        start: '34234320000000',
        end: '34234320000001',
      },
      satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
      inscriptions: [],
    },
    {
      year_mined: 2009,
      block: 11,
      offset: 1,
      range: {
        start: '34234320000003',
        end: '34234320000004',
      },
      satributes: [],
      inscriptions: [
        {
          content_type: 'image/png',
          id: '6b186d467d817e4d086a9d1bf93785d736df6431c1cc9c305571161d616d05d0i0',
          inscription_number: 11067474,
        },
      ],
    },
  ],
  xVersion: 1,
};

export const exoticInscriptionNotPartOfBundle: ApiBundleV2 & { xVersion: number } = {
  block_height: 803128,
  txid: 'b143d94bb084eb429c3d3d4e8ebc9ee7b6a070a3b9b1a92849fe4059f8c2da09',
  value: 1,
  vout: 0,
  sat_ranges: [
    {
      year_mined: 2009,
      block: 10,
      offset: 0,
      range: {
        start: '34234320000000',
        end: '34234320000001',
      },
      satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
      inscriptions: [
        {
          content_type: 'text/html',
          id: 'b143d94bb084eb429c3d3d4e8ebc9ee7b6a070a3b9b1a92849fe4059f8c2da09i0',
          inscription_number: 32218693,
        },
      ],
    },
  ],
  xVersion: 1,
};

export const mockData: Response = {
  xVersion: 1,
  limit: 30,
  offset: 0,
  total: 1,
  results: [
    {
      block_height: 803128,
      txid: 'f5aa0649f2e5d0c6402c2d6b64ba6ea89e8be836a2ad01cbb0cdcc8721e314c7',
      value: 21000,
      vout: 0,
      sat_ranges: [
        {
          year_mined: 2009,
          block: 9,
          offset: 0,
          range: {
            start: '34234320000000',
            end: '34234320010000',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 10000,
          range: {
            start: '34234320010001',
            end: '34234320010002',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [
            {
              content_type: 'text/plain;charset=utf-8',
              id: '09c094c3f1ab71c9be7a356a0f1af21b0e552c18d50372fd3799430c890ef135i0',
              inscription_number: 123141212,
            },
          ],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 10002,
          range: {
            start: '34234320010002',
            end: '34234320020000',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 20001,
          range: {
            start: '45000000001',
            end: '45000000999',
          },
          satributes: ['BLOCK9', 'NAKAMOTO', 'VINTAGE', 'FIRST_TRANSACTION'],
          inscriptions: [],
        },
      ],
    },
  ],
};

// TestCase 1 - Empty response
export const mockTestCase1: Response = {
  xVersion: 1,
  limit: 30,
  offset: 0,
  total: 0,
  results: [],
};

// TestCase 2 - 3 bundles
const { xVersion, ...bundle } = inscriptionPartOfBundle;
export const mockTestCase3: Response = {
  xVersion: 1,
  limit: 30,
  offset: 0,
  total: 5,
  results: [
    {
      block_height: 803128,
      txid: 'f5aa0649f2e5d0c6402c2d6b64ba6ea89e8be836a2ad01cbb0cdcc8721e314c7',
      value: 20997,
      vout: 0,
      sat_ranges: [
        {
          year_mined: 2009,
          block: 9,
          offset: 0,
          range: {
            start: '34234320000000',
            end: '34234320010000',
          },
          satributes: ['RARE', 'PIZZA', 'PALINDROME'],
          inscriptions: [],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 10000,
          range: {
            start: '34234320010001',
            end: '34234320010002',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [
            {
              content_type: 'text/plain;charset=utf-8',
              id: '09c094c3f1ab71c9be7a356a0f1af21b0e552c18d50372fd3799430c890ef135i0',
              inscription_number: 123141212,
            },
          ],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 10002,
          range: {
            start: '34234320010002',
            end: '34234320020000',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 20001,
          range: {
            start: '45000000001',
            end: '45000000999',
          },
          satributes: ['BLOCK9', 'NAKAMOTO', 'VINTAGE', 'FIRST_TRANSACTION'],
          inscriptions: [],
        },
      ],
    },
    {
      block_height: 803128,
      txid: 'f5aa0649f2e5d0c6402c2d6b64ba6ea89e8be836a2ad01cbb0cdcc8721e314c8',
      value: 21000,
      vout: 0,
      sat_ranges: [
        {
          year_mined: 2009,
          block: 9,
          offset: 0,
          range: {
            start: '34234320000000',
            end: '34234320010000',
          },
          satributes: ['MYTHIC', 'BLOCK78'],
          inscriptions: [],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 10000,
          range: {
            start: '34234320010001',
            end: '34234320010001',
          },
          satributes: ['PIZZA'],
          inscriptions: [
            {
              content_type: 'text/plain;charset=utf-8',
              id: '09c094c3f1ab71c9be7a356a0f1af21b0e552c18d50372fd3799430c890ef135i0',
              inscription_number: 123141212,
            },
          ],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 10002,
          range: {
            start: '34234320010002',
            end: '34234320020000',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 20001,
          range: {
            start: '45000000001',
            end: '45000000999',
          },
          satributes: ['BLOCK9', 'NAKAMOTO'],
          inscriptions: [],
        },
      ],
    },
    {
      block_height: 803128,
      txid: 'f5aa0649f2e5d0c6402c2d6b64ba6ea89e8be836a2ad01cbb0cdcc8721e314c9',
      value: 21000,
      vout: 0,
      sat_ranges: [
        {
          year_mined: 2009,
          block: 9,
          offset: 0,
          range: {
            start: '34234320000000',
            end: '34234320000003',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 3,
          range: {
            start: '34234320010001',
            end: '34234320010001',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [
            {
              content_type: 'text/plain;charset=utf-8',
              id: '09c094c3f1ab71c9be7a356a0f1af21b0e552c18d50372fd3799430c890ef135i0',
              inscription_number: 123141212,
            },
          ],
        },
        {
          year_mined: 2009,
          block: 9,
          offset: 4,
          range: {
            start: '34234320010002',
            end: '34234320010003',
          },
          satributes: [
            'HITMAN',
            'NAME_PALINDROME',
            'NAKAMOTO',
            'VINTAGE',
            'FIRST_TRANSACTION',
            '2D_PALINDROME',
            'BLOCK78',
            'BLOCK9',
          ],
          inscriptions: [],
        },
      ],
    },
    {
      block_height: 803128,
      txid: 'f5aa0649f2e5d0c6402c2d6b64ba6ea89e8be836a2ad01cbb0cdcc8721e314d1',
      value: 100,
      vout: 0,
      sat_ranges: [
        {
          year_mined: 2009,
          block: 9,
          offset: 0,
          range: {
            start: '34234320000000',
            end: '34234320000003',
          },
          satributes: ['UNCOMMON', 'PIZZA', 'PALINDROME'],
          inscriptions: [],
        },
      ],
    },
    bundle,
    {
      block_height: 803128,
      txid: 'f5aa0649f2e5d0c6402c2d6b64ba6ea89e8be836a2ad01cbb0cdcc8721e314d2',
      value: 100,
      vout: 0,
      sat_ranges: [],
    },
  ],
};
