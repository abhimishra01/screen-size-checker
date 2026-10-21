// Common screen sizes, used by the comparison table and the "closest common size" line.
// diag = marketed diagonal in inches. ratio = long side / short side of the visible panel.
// Ratios come from the native resolution of typical panels at that size (for example 2560 x 1664 for a 13.6 in laptop).

export const SIZE_GROUPS = [
  {
    id: 'phone', name: 'Phones', rows: [
      { diag: 5.4, ratio: 19.5 / 9, ratioLabel: '19.5:9', note: 'Small phones' },
      { diag: 6.1, ratio: 19.5 / 9, ratioLabel: '19.5:9', note: 'Most standard phones' },
      { diag: 6.3, ratio: 19.5 / 9, ratioLabel: '19.5:9', note: 'Standard phones, newer models' },
      { diag: 6.7, ratio: 19.5 / 9, ratioLabel: '19.5:9', note: 'Large phones' },
      { diag: 6.9, ratio: 19.5 / 9, ratioLabel: '19.5:9', note: 'The largest phones' },
    ],
  },
  {
    id: 'tablet', name: 'Tablets', rows: [
      { diag: 8.3, ratio: 2266 / 1488, ratioLabel: 'about 3:2', note: 'Small tablets' },
      { diag: 10.9, ratio: 2360 / 1640, ratioLabel: 'about 10:7', note: 'Standard tablets' },
      { diag: 11, ratio: 2420 / 1668, ratioLabel: 'about 10:7', note: '11 in tablets' },
      { diag: 13, ratio: 4 / 3, ratioLabel: '4:3', note: 'Large tablets' },
    ],
  },
  {
    id: 'laptop', name: 'Laptops', rows: [
      { diag: 11.6, ratio: 16 / 9, ratioLabel: '16:9', note: 'Small school laptops' },
      { diag: 13.3, ratio: 16 / 10, ratioLabel: '16:10', note: 'Small laptops' },
      { diag: 13.6, ratio: 2560 / 1664, ratioLabel: 'about 16:10', note: '13 in thin laptops' },
      { diag: 14, ratio: 16 / 10, ratioLabel: '16:10', note: 'Everyday laptops' },
      { diag: 15.3, ratio: 2880 / 1864, ratioLabel: 'about 16:10', note: '15 in thin laptops' },
      { diag: 15.6, ratio: 16 / 9, ratioLabel: '16:9', note: 'Most 15 in laptops' },
      { diag: 16, ratio: 16 / 10, ratioLabel: '16:10', note: 'Large laptops' },
      { diag: 17.3, ratio: 16 / 9, ratioLabel: '16:9', note: 'Desktop replacement laptops' },
    ],
  },
  {
    id: 'monitor', name: 'Monitors', rows: [
      { diag: 21.5, ratio: 16 / 9, ratioLabel: '16:9', note: 'Small monitors' },
      { diag: 23.8, ratio: 16 / 9, ratioLabel: '16:9', note: 'Sold as 24 in' },
      { diag: 27, ratio: 16 / 9, ratioLabel: '16:9', note: 'Common desk monitors' },
      { diag: 31.5, ratio: 16 / 9, ratioLabel: '16:9', note: 'Sold as 32 in' },
      { diag: 34, ratio: 3440 / 1440, ratioLabel: 'about 21:9', note: 'Ultrawide' },
      { diag: 49, ratio: 32 / 9, ratioLabel: '32:9', note: 'Super ultrawide' },
    ],
  },
];

export const ALL_SIZES = SIZE_GROUPS.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.id, id: `${g.id}-${r.diag}` })));
