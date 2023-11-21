import { ApiBundleV2 } from '@utils/rareSats';

export type Response = {
  xVersion: number;
  limit: number;
  offset: number;
  total: number;
  results: ApiBundleV2[];
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
export const mockTestCase3: Response = {
  xVersion: 1,
  limit: 30,
  offset: 0,
  total: 1,
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
          satributes: ['BLOCK78'],
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
          satributes: ['HITMAN', 'NAME_PALINDROME', 'NAKAMOTO', 'VINTAGE', 'FIRST_TRANSACTION'],
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
    {
      block_height: 803128,
      txid: 'f5aa0649f2e5d0c6402c2d6b64ba6ea89e8be836a2ad01cbb0cdcc8721e314d2',
      value: 100,
      vout: 0,
      sat_ranges: [],
    },
  ],
};
