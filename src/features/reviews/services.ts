import apiClient from '../../lib/apiClient';

export interface Review {
  id: string;
  authorId: string;
  opportunityId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    storeName?: string;
    avatarUrl?: string;
  };
  opportunity?: {
    id: string;
    title: string;
  };
}

export async function createReview(opportunityId: string, rating: number, comment?: string): Promise<Review> {
  const { data } = await apiClient.post<Review>('/reviews', {
    opportunityId,
    rating,
    comment,
  });
  return data;
}

export async function getOpportunityReviews(opportunityId: string): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>(`/opportunities/${opportunityId}/reviews`);
  return data;
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>(`/users/${userId}/reviews`);
  return data;
}

export async function getSupplierReviews(supplierId: string): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>(`/suppliers/${supplierId}/reviews`);
  return data;
}
