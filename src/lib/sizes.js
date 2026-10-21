// Common screen sizes, used by the comparison table and the "closest common size" line.
// diag = marketed diagonal in inches. px = native resolution of a typical panel at that size, long side first.
// The table's shape label comes from px through aspect(), so it matches the shape shown for a measured screen.

const row = (diag, w, h, note) => ({ diag, px: [w, h], ratio: w / h, note });

export const SIZE_GROUPS = [
  {
    id: 'phone', name: 'Phones', rows: [
      row(5.4, 2340, 1080, 'Small phones'),
      row(5.8, 2436, 1125, 'Older small phones'),
      row(6.1, 2532, 1170, 'Most standard phones'),
      row(6.3, 2622, 1206, 'Standard phones, newer models'),
      row(6.5, 2688, 1242, 'Older large phones'),
      row(6.7, 2778, 1284, 'Large phones'),
      row(6.8, 3088, 1440, 'Large Android phones'),
      row(6.9, 2868, 1320, 'The largest phones'),
    ],
  },
  {
    id: 'tablet', name: 'Tablets', rows: [
      row(8.3, 2266, 1488, 'Small tablets'),
      row(10.2, 2160, 1620, 'Older standard tablets'),
      row(10.9, 2360, 1640, 'Standard tablets'),
      row(11, 2420, 1668, '11 in tablets'),
      row(13, 2752, 2064, 'Large tablets (12.9 and 13 in)'),
    ],
  },
  {
    id: 'laptop', name: 'Laptops', rows: [
      row(11.6, 1366, 768, 'Small school laptops'),
      row(13.3, 2560, 1600, 'Small laptops'),
      row(13.6, 2560, 1664, '13 in thin laptops'),
      row(14, 1920, 1200, 'Everyday laptops'),
      row(14.2, 3024, 1964, '14 in pro laptops'),
      row(15.3, 2880, 1864, '15 in thin laptops'),
      row(15.6, 1920, 1080, 'Most 15 in laptops'),
      row(16, 1920, 1200, 'Large laptops'),
      row(16.2, 3456, 2234, '16 in pro laptops'),
      row(17.3, 1920, 1080, 'Desktop replacement laptops'),
    ],
  },
  {
    id: 'monitor', name: 'Monitors', rows: [
      row(21.5, 1920, 1080, 'Small monitors'),
      row(23.8, 1920, 1080, 'Sold as 24 in'),
      row(24.5, 1920, 1080, 'Gaming monitors, sold as 25 in'),
      row(27, 2560, 1440, 'Common desk monitors'),
      row(31.5, 2560, 1440, 'Sold as 32 in'),
      row(34, 3440, 1440, 'Ultrawide'),
      row(49, 5120, 1440, 'Super ultrawide'),
    ],
  },
];

export const ALL_SIZES = SIZE_GROUPS.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.id, id: `${g.id}-${r.diag}` })));
