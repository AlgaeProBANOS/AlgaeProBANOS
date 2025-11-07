import { Species } from "@/api/apb.client";

// interface Applications {
//   industrial: string | null;
//   agriculture: string | null;
//   medicinal: string | null;
//   cosmetics: string | null;
//   environmental: string | null;
//   humanConsumption: string | null;
// }

// interface Certifications {
//   [key: string]: any;
// }

// interface EmodnetPoint {
//   lat: number;
//   lon: number;
// }

// export function getMatchingSpeciesIds(
//   speciesList: Species[],
//   productQuery: string
// ): string[] {
//   const query = (productQuery || "").toLowerCase().trim();
//   console.log("QUERY", query);
  

//   const productCriteria: Record<
//     string,
//     { keywords: string[]; applications: (keyof Applications)[]; properties: string[] }
//   > = {
//     biofuel: {
//       keywords: ["biofuel", "energy", "oil", "biomass", "fuel", "biodiesel"],
//       applications: ["industrial"],
//       properties: ["high growth rate", "oil content"],
//     },
//     "fish feed": {
//       keywords: [
//         "protein",
//         "feed",
//         "aquaculture",
//         "nutrition",
//         "fish",
//         "animal feed",
//       ],
//       applications: ["agriculture", "humanConsumption"],
//       properties: ["protein"],
//     },
//     cosmetics: {
//       keywords: ["cosmetic", "beauty", "skin", "care", "lotion", "cream"],
//       applications: ["cosmetics"],
//       properties: ["antioxidant", "moisturizing"],
//     },
//     medicine: {
//       keywords: [
//         "medicine",
//         "medical",
//         "pharmaceutical",
//         "drug",
//         "health",
//         "therapeutic",
//         "treatment",
//       ],
//       applications: ["medicinal"],
//       properties: ["bioactive", "medicinal"],
//     },
//     food: {
//       keywords: [
//         "food",
//         "nutrition",
//         "dietary",
//         "supplement",
//         "edible",
//         "consumption",
//         "ingredient",
//       ],
//       applications: ["humanConsumption"],
//       properties: ["edible", "nutritional"],
//     },
//     fertilizer: {
//       keywords: [
//         "fertilizer",
//         "fertiliser",
//         "soil",
//         "agriculture",
//         "nutrient",
//         "crop",
//         "plant growth",
//       ],
//       applications: ["agriculture"],
//       properties: ["nutrient rich"],
//     },
//     environmental: {
//       keywords: [
//         "environmental",
//         "pollution",
//         "waste",
//         "treatment",
//         "remediation",
//         "cleanup",
//         "biofilter",
//       ],
//       applications: ["environmental"],
//       properties: ["environmental"],
//     },
//   };

//   const hasText = (v: any): boolean =>
//     v !== null && v !== undefined && String(v).trim().length > 0;

//   // --- Find best matching criteria ---
//   let matchingCriteria:
//     | { keywords: string[]; applications: (keyof Applications)[]; properties: string[] }
//     | null = null;
//   let bestMatchScore = 0;

//   for (const [productType, criteria] of Object.entries(productCriteria)) {
//     let score = 0;
//     if (query.includes(productType)) score += 3;
//     score += criteria.keywords.reduce(
//       (sum, kw) => sum + (query.includes(kw) ? 1 : 0),
//       0
//     );

//     if (score > bestMatchScore) {
//       bestMatchScore = score;
//       matchingCriteria = criteria;
//     }
//   }

//   if (!matchingCriteria) {
//     for (const criteria of Object.values(productCriteria)) {
//       if (criteria.keywords.some((kw) => query.includes(kw))) {
//         matchingCriteria = criteria;
//         break;
//       }
//     }
//   }

//   if (!matchingCriteria) {
//     matchingCriteria = {
//       keywords: [query],
//       applications: [
//         "industrial",
//         "agriculture",
//         "medicinal",
//         "cosmetics",
//         "environmental",
//         "humanConsumption",
//       ],
//       properties: [],
//     };
//   }

//   const matchingIds: string[] = [];


//   for (const sp of speciesList) {
//     let matchScore = 0;

//     // Check applications
//     for (const appKey of matchingCriteria.applications) {
//       const appValue = sp.applications[appKey];
//       if (hasText(appValue)) {
//         const lower = appValue!.toLowerCase();
//         const keywordMatches = matchingCriteria.keywords.filter((kw) =>
//           lower.includes(kw)
//         ).length;
//         if (keywordMatches > 0) matchScore += 2 + keywordMatches;
//         else matchScore += 1;
//       }
//     }

//     // Check for keywords in other text fields (similar to “relevant columns”)
//     const textFields = [
//       sp.color,
//       sp.division,
//       sp.habitat,
//       sp.commonName,
//       sp.nutritionalProfile,
//       sp.geographicPosition,
//     ];
//     for (const field of textFields) {
//       if (typeof field === "string" && field.length > 0) {
//         const lower = field.toLowerCase();
//         if (matchingCriteria.keywords.some((kw) => lower.includes(kw))) {
//           matchScore += 2;
//         }
//       }
//     }

//     if (matchScore > 0) {
//       matchingIds.push(sp.scientificName);
//     }
//   }

//   return matchingIds;
// }



interface Applications {
  industrial: string | null;
  agriculture: string | null;
  medicinal: string | null;
  cosmetics: string | null;
  environmental: string | null;
  humanConsumption: string | null;
}

interface Certifications {
  [key: string]: any;
}

interface EmodnetPoint {
  lat: number;
  lon: number;
}

export interface MatchResult {
  id: string;
  matchScore: number;
  matchReasons: string[];
}

export const productCriteria: Record<
    string,
    { keywords: string[]; applications: (keyof Applications)[]; properties: string[] }
  > = {
    biofuel: {
      keywords: ["biofuel", "energy", "oil", "biomass", "fuel", "biodiesel"],
      applications: ["industrial"],
      properties: ["high growth rate", "oil content"],
    },
    "fish feed": {
      keywords: [
        "protein",
        "feed",
        "aquaculture",
        "nutrition",
        "fish",
        "animal feed",
      ],
      applications: ["agriculture", "humanConsumption"],
      properties: ["protein"],
    },
    cosmetics: {
      keywords: ["cosmetic", "beauty", "skin", "care", "lotion", "cream"],
      applications: ["cosmetics"],
      properties: ["antioxidant", "moisturizing"],
    },
    medicine: {
      keywords: [
        "medicine",
        "medical",
        "pharmaceutical",
        "drug",
        "health",
        "therapeutic",
        "treatment",
      ],
      applications: ["medicinal"],
      properties: ["bioactive", "medicinal"],
    },
    food: {
      keywords: [
        "food",
        "nutrition",
        "dietary",
        "supplement",
        "edible",
        "consumption",
        "ingredient",
      ],
      applications: ["humanConsumption"],
      properties: ["edible", "nutritional"],
    },
    fertilizer: {
      keywords: [
        "fertilizer",
        "fertiliser",
        "soil",
        "agriculture",
        "nutrient",
        "crop",
        "plant growth",
      ],
      applications: ["agriculture"],
      properties: ["nutrient rich"],
    },
    environmental: {
      keywords: [
        "environmental",
        "pollution",
        "waste",
        "treatment",
        "remediation",
        "cleanup",
        "biofilter",
      ],
      applications: ["environmental"],
      properties: ["environmental"],
    },
  };

export function getMatchingSpecies(
  speciesList: Species[],
  productQuery: string
): MatchResult[] {
  const query = (productQuery || "").toLowerCase().trim();
  
  const hasText = (v: any): boolean =>
    v !== null && v !== undefined && String(v).trim().length > 0;

  // --- Step 1: Determine the best matching product criteria ---
  let matchingCriteria:
    | { keywords: string[]; applications: (keyof Applications)[]; properties: string[] }
    | null = null;
  let bestMatchScore = 0;

  for (const [productType, criteria] of Object.entries(productCriteria)) {
    let score = 0;
    if (query.includes(productType)) score += 3;
    score += criteria.keywords.reduce(
      (sum, kw) => sum + (query.includes(kw) ? 1 : 0),
      0
    );

    if (score > bestMatchScore) {
      bestMatchScore = score;
      matchingCriteria = criteria;
    }
  }

  if (!matchingCriteria) {
    for (const criteria of Object.values(productCriteria)) {
      if (criteria.keywords.some((kw) => query.includes(kw))) {
        matchingCriteria = criteria;
        break;
      }
    }
  }

  if (!matchingCriteria) {
    matchingCriteria = {
      keywords: [query],
      applications: [
        "industrial",
        "agriculture",
        "medicinal",
        "cosmetics",
        "environmental",
        "humanConsumption",
      ],
      properties: [],
    };
  }

//   console.log("Matching criteria found:", matchingCriteria);

  // --- Step 2: Evaluate each species ---
  const results: MatchResult[] = [];

  for (const sp of speciesList) {
    let matchScore = 0;
    const matchReasons: string[] = [];

    // Check applications
    for (const appKey of matchingCriteria.applications) {
      const appValue = sp.applications[appKey];
      if (hasText(appValue)) {
        const lower = appValue!.toLowerCase();
        const keywordMatches = matchingCriteria.keywords.filter((kw) =>
          lower.includes(kw)
        ).length;

        if (keywordMatches > 0) {
          matchScore += 2 + keywordMatches;
          matchReasons.push(
            `Suitable for ${appKey.toLowerCase()} with specific relevance to ${query}`
          );
        } else {
          matchScore += 1;
          matchReasons.push(`Suitable for ${appKey.toLowerCase()}`);
        }
      }
    }

    // Check keywords in descriptive text fields
    const textFields = [
      sp.color,
      sp.division,
      sp.habitat,
      sp.commonName,
      sp.nutritionalProfile,
      sp.geographicPosition,
    ];

    for (const field of textFields) {
      if (typeof field === "string" && field.length > 0) {
        const lower = field.toLowerCase();
        if (matchingCriteria.keywords.some((kw) => lower.includes(kw))) {
          matchScore += 2;
          matchReasons.push(
            `Contains specific properties relevant to ${query} (${field})`
          );
        }
      }
    }

    if (matchScore > 0) {
      results.push({
        id: sp.scientificName,
        matchScore,
        matchReasons: Array.from(new Set(matchReasons)), 
      });
    }
  }

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
//   console.log(`Total results found: ${results.length}`);

  return results;
}
