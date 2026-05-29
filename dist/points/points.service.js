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
var PointsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const clubz_api_service_1 = require("./clubz-api.service");
const prisma_service_1 = require("../prisma/prisma.service");
/**
 * PointsService — Le cœur du backend Points Open.
 *
 * Toutes les 5 minutes, ce service :
 *  1. Récupère la liste des communautés où le widget est installé
 *  2. Pour chaque installation, lit la config définie par l'admin
 *  3. Récupère les membres actifs de la communauté
 *  4. Calcule les points à distribuer en fonction des paramètres
 *  5. Appelle l'API Clubz pour attribuer les nouveaux points
 */
let PointsService = PointsService_1 = class PointsService {
    constructor(clubzApi, prisma) {
        this.clubzApi = clubzApi;
        this.prisma = prisma;
        this.logger = new common_1.Logger(PointsService_1.name);
    }
    /**
     * Cron déclenché toutes les 5 minutes.
     */
    async recalculatePoints() {
        this.logger.log('⏰ Cron déclenché — Recalcul des Points Open...');
        // ── Étape 1 : Récupérer toutes les installations actives ─────────────────
        const installations = await this.clubzApi.getInstallations();
        if (installations.length === 0) {
            this.logger.warn('Aucune installation active trouvée. Cron terminé.');
            return;
        }
        this.logger.log(`📦 ${installations.length} installation(s) à traiter.`);
        // ── Étape 2 : Traiter chaque installation ────────────────────────────────
        for (const installation of installations) {
            await this.processInstallation(installation);
        }
        this.logger.log('✅ Recalcul terminé.');
    }
    async processInstallation(installation) {
        var _a, _b, _c;
        const { communityId, config } = installation;
        // Résoudre les paramètres avec les valeurs par défaut si l'admin ne les a pas configurés
        const baseQuota = (_a = config === null || config === void 0 ? void 0 : config.baseQuota) !== null && _a !== void 0 ? _a : 100;
        const pointsPerPost = (_b = config === null || config === void 0 ? void 0 : config.pointsPerPost) !== null && _b !== void 0 ? _b : 20;
        const pointsPerEvent = (_c = config === null || config === void 0 ? void 0 : config.pointsPerEvent) !== null && _c !== void 0 ? _c : 50;
        this.logger.log(`  🏘 Communauté ${communityId} — quota=${baseQuota}, /post=${pointsPerPost}, /event=${pointsPerEvent}`);
        // ── Étape 3 : Récupérer les membres ──────────────────────────────────────
        const members = await this.clubzApi.getCommunityMembers(communityId);
        if (members.length === 0) {
            this.logger.warn(`  ⚠️  Aucun membre trouvé pour la communauté ${communityId}.`);
            return;
        }
        // ── Étape 4 & 5 : Calculer et distribuer les points ──────────────────────
        const rewardPromises = members.map(async (member) => {
            var _a;
            // Récupération de l'activité du membre pour le calcul précis depuis clubz_api
            const activity = await this.clubzApi.getMemberActivity(communityId, member.id);
            const postsPoints = activity.postsCount * pointsPerPost;
            const eventsPoints = activity.eventsCount * pointsPerEvent;
            const totalPoints = baseQuota + postsPoints + eventsPoints;
            // Récupérer l'ancien solde depuis la DB locale
            const previousActivity = await this.prisma.memberActivity.findUnique({
                where: { communityId_memberId: { communityId, memberId: member.id } }
            });
            const previousPoints = (_a = previousActivity === null || previousActivity === void 0 ? void 0 : previousActivity.totalPoints) !== null && _a !== void 0 ? _a : 0;
            const newPoints = totalPoints - previousPoints;
            this.logger.log(`  ↳ Membre ${member.name} (${member.id}) : ${activity.postsCount} posts, ${activity.eventsCount} events => ${totalPoints} pts au total (+${newPoints} nouveaux)`);
            if (newPoints > 0) {
                await this.clubzApi.rewardUser(member.id, newPoints, `Points Open (diff): posts (${activity.postsCount}), events (${activity.eventsCount})`);
            }
            // Sauvegarder dans la DB locale
            await this.prisma.memberActivity.upsert({
                where: { communityId_memberId: { communityId, memberId: member.id } },
                update: { postsCount: activity.postsCount, eventsCount: activity.eventsCount, totalPoints },
                create: { communityId, memberId: member.id, postsCount: activity.postsCount, eventsCount: activity.eventsCount, totalPoints }
            });
        });
        await Promise.allSettled(rewardPromises);
        this.logger.log(`  🎉 ${members.length} membres traités pour la communauté ${communityId}.`);
    }
};
exports.PointsService = PointsService;
__decorate([
    (0, schedule_1.Cron)('0 */5 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PointsService.prototype, "recalculatePoints", null);
exports.PointsService = PointsService = PointsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clubz_api_service_1.ClubzApiService,
        prisma_service_1.PrismaService])
], PointsService);
