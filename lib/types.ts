export interface Project {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  totalKeys?: number;
}

export interface KeyItem {
  id: string;
  key: string;
  description?: string;
  featureId: string;
}

export interface Translation {
  id: string;
  locale: string;
  value: string;
  keyId: string;
}

export interface KeyItemWithFeature extends KeyItem {
  feature?: Feature;
}

export interface Language {
  id: string;
  locale: string;
  name: string;
  isActive: boolean;
}

export interface MissingTranslation {
  keyId: string;
  keyName: string;
  featureId: string;
  featureName: string;
  projectId: string;
  projectName: string;
  missingLocales: string[];
  filledLocales: string[];
}

export interface CompletionByLocale {
  locale: string;
  total: number;
  filled: number;
  percentage: number;
}

export interface CompletionByFeature {
  featureId: string;
  featureName: string;
  total: number;
  filled: number;
  percentage: number;
}

export interface RecentlyUpdatedTranslation {
  keyId: string;
  keyName: string;
  locale: string;
  value: string;
  updatedAt: string;
}

export interface MostActiveFeature {
  featureId: string;
  featureName: string;
  translationCount: number;
}

export interface DuplicateKey {
  keyName: string;
  features: Array<{
    featureId: string;
    featureName: string;
  }>;
}

export interface TranslationStatistics {
  missingTranslations: MissingTranslation[];
  overallCompletionPercentage: number;
  completionByLocale: CompletionByLocale[];
  completionByFeature: CompletionByFeature[];
  emptyValueCount: number;
  recentlyUpdated: RecentlyUpdatedTranslation[];
  totalTranslations: number;
  mostActiveFeatures: MostActiveFeature[];
  orphanedKeysCount: number;
  duplicateKeys: DuplicateKey[];
  activeFeaturesWithMissingTranslations: number;
}

// Paginated Translation List Types
export interface TranslationListItem {
  id: string;
  keyId: string;
  keyName: string;
  featureId: string;
  featureName: string;
  locale: string;
  value: string;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TranslationSearchParams {
  q?: string;
  locale?: string;
  featureId?: string;
  projectId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

