"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ClubzApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubzApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
/**
 * Ce service est le "SDK Server-to-Server" pour communiquer avec l'API Clubz.
 * Il utilise la Clé API développeur pour s'authentifier.
 */
let ClubzApiService = ClubzApiService_1 = class ClubzApiService {
    constructor() {
        this.logger = new common_1.Logger(ClubzApiService_1.name);
        const apiUrl = process.env.CLUBZ_API_URL;
        const apiKey = process.env.CLUBZ_API_KEY;
        this.widgetId = process.env.WIDGET_ID || '';
        if (!apiUrl || !apiKey || !this.widgetId) {
            throw new Error('Missing required env vars: CLUBZ_API_URL, CLUBZ_API_KEY, WIDGET_ID');
        }
        this.client = axios_1.default.create({
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
    async getInstallations() {
        try {
            const { data } = await this.client.get(`/developer/data/widgets/${this.widgetId}/installations`);
            return data;
        }
        catch (err) {
            this.logger.error(`Failed to get installations: ${err.message}`);
            return [];
        }
    }
    /**
     * Récupère les membres d'une communauté.
     * GET /developer/data/communities/:id/members
     */
    async getCommunityMembers(communityId) {
        try {
            const { data } = await this.client.get(`/developer/data/communities/${communityId}/members`);
            return data;
        }
        catch (err) {
            this.logger.error(`Failed to get members for community ${communityId}: ${err.message}`);
            return [];
        }
    }
    /**
     * Attribue des Points Open à un utilisateur.
     * POST /developer/data/gamification/reward
     */
    async rewardUser(userId, points, reason) {
        try {
            await this.client.post('/developer/data/gamification/reward', { userId, points, reason });
        }
        catch (err) {
            this.logger.error(`Failed to reward user ${userId}: ${err.message}`);
        }
    }
    /**
     * Récupère l'activité d'un membre (posts, events) pour calculer ses points.
     * GET /developer/data/communities/:communityId/members/:memberId/activity
     */
    async getMemberActivity(communityId, memberId) {
        try {
            const { data } = await this.client.get(`/developer/data/communities/${communityId}/members/${memberId}/activity`);
            return {
                postsCount: data.postsCount || 0,
                eventsCount: data.eventsCount || 0,
            };
        }
        catch (err) {
            this.logger.error(`Failed to get activity for member ${memberId}: ${err.message}`);
            throw err;
        }
    }
};
exports.ClubzApiService = ClubzApiService;
exports.ClubzApiService = ClubzApiService = ClubzApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ClubzApiService);
