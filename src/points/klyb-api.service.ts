import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

/**
 * Ce service est le "SDK Server-to-Server" pour communiquer avec l'API Klyb.
 * Il utilise la Clé API développeur pour s'authentifier.
 */
@Injectable()
export class KlybApiService {
  private readonly logger = new Logger(KlybApiService.name);
  private readonly client: AxiosInstance;
  private readonly widgetId: string;

  constructor() {
    const apiUrl = process.env.KLYB_API_URL;
    const apiKey = process.env.KLYB_API_KEY;
    this.widgetId = process.env.WIDGET_ID || '';

    if (!apiUrl || !apiKey || !this.widgetId) {
      throw new Error('Missing required env vars: KLYB_API_URL, KLYB_API_KEY, WIDGET_ID');
    }

    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Récupère toutes les installations de ce widget avec leur config communauté.
   * GET /developer/data/widgets/:widgetId/installations
   */
  async getInstallations(): Promise<Installation[]> {
    try {
      const { data } = await this.client.get(`/developer/data/widgets/${this.widgetId}/installations`);
      return data;
    } catch (err: any) {
      this.logger.error(`Failed to get installations: ${err.message}`);
      return [];
    }
  }

  /**
   * Récupère les membres d'une communauté.
   * GET /developer/data/communities/:id/members
   */
  async getCommunityMembers(communityId: string): Promise<Member[]> {
    try {
      const { data } = await this.client.get(`/developer/data/communities/${communityId}/members`);
      return data.map((item: any) => ({
        id: item.userId,
        username: item.user?.username || '',
        name: item.user?.name || '',
        points: item.user?.points || 0,
      }));
    } catch (err: any) {
      this.logger.error(`Failed to get members for community ${communityId}: ${err.message}`);
      return [];
    }
  }

  /**
   * Attribue des Points Open à un utilisateur.
   * POST /developer/data/gamification/reward
   */
  async rewardUser(userId: string, points: number, reason: string): Promise<void> {
    try {
      await this.client.post('/developer/data/gamification/reward', { userId, points, reason });
    } catch (err: any) {
      this.logger.error(`Failed to reward user ${userId}: ${err.message}`);
    }
  }

  /**
   * Récupère l'activité d'un membre (posts, events) pour calculer ses points.
   * GET /developer/data/communities/:communityId/members/:memberId/activity
   */
  async getMemberActivity(communityId: string, memberId: string): Promise<{ postsCount: number; eventsCount: number }> {
    try {
      const { data } = await this.client.get(`/developer/data/communities/${communityId}/members/${memberId}/activity`);
      return {
        postsCount: data.activity?.totalPosts || 0,
        eventsCount: data.activity?.totalEvents || 0,
      };
    } catch (err: any) {
      this.logger.error(`Failed to get activity for member ${memberId}: ${err.message}`);
      throw err;
    }
  }
}

export interface Installation {
  id: string;
  widgetId: string;
  communityId: string;
  isActive: boolean;
  /** La config définie par l'admin de la communauté */
  config: {
    baseQuota?: number;
    pointsPerPost?: number;
    pointsPerEvent?: number;
  };
}

export interface Member {
  id: string;
  username: string;
  name: string;
  points: number;
}
