// Mapping between navigation IDs and URL paths
export const routeMap: Record<string, string> = {
  'home': '/',
  'symptoms': '/symptom-analyzer',
  'drugs': '/drug-interactions',
  'terms': '/medical-terms',
  'medical-image': '/medical-image-analyzer',
  'medicine': '/medicine-analyzer',
  'chat': '/chat',
  'reports': '/report-summarizer',
  'policy': '/policy-query',
  'emergency': '/emergency',
  'about': '/about',
};

// Reverse mapping from paths to IDs
export const pathToIdMap: Record<string, string> = Object.entries(routeMap).reduce(
  (acc, [id, path]) => ({ ...acc, [path]: id }),
  {}
);
