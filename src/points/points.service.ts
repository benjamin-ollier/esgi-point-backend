import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { KlybApiService } from './klyb-api.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * PointsService — Le cœur du backend Points Open.
 *
 * Toutes les 5 minutes, ce service :
 *  1. Récupère la liste des communautés où le widget est installé
 *  2. Pour chaque installation, lit la config définie par l'admin
 *  3. Récupère les membres actifs de la communauté
 *  4. Calcule les points à distribuer en fonction des paramètres
 *  5. Appelle l'API Klyb pour attribuer les nouveaux points
 */
@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    private readonly klybApi: KlybApiService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Cron déclenché toutes les 5 minutes.
   */
  @Cron('0 */5 * * * *')
  async recalculatePoints(): Promise<void> {
    this.logger.log('⏰ Cron déclenché — Recalcul des Points Open...');

    // ── Étape 1 : Récupérer toutes les installations actives ─────────────────
    const installations = await this.klybApi.getInstallations();

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

  private async processInstallation(installation: any): Promise<void> {
    const { communityId, config } = installation;

    // Résoudre les paramètres avec les valeurs par défaut si l'admin ne les a pas configurés
    const baseQuota = config?.baseQuota ?? 100;
    const pointsPerPost = config?.pointsPerPost ?? 20;
    const pointsPerEvent = config?.pointsPerEvent ?? 50;

    this.logger.log(
      `  🏘 Communauté ${communityId} — quota=${baseQuota}, /post=${pointsPerPost}, /event=${pointsPerEvent}`
    );

    // ── Étape 3 : Récupérer les membres ──────────────────────────────────────
    const members = await this.klybApi.getCommunityMembers(communityId);

    if (members.length === 0) {
      this.logger.warn(`  ⚠️  Aucun membre trouvé pour la communauté ${communityId}.`);
      return;
    }

    // ── Étape 4 & 5 : Calculer et distribuer les points ──────────────────────
    const rewardPromises = members.map(async (member) => {
      // Récupération de l'activité du membre pour le calcul précis depuis klyb_api
      const activity = await this.klybApi.getMemberActivity(communityId, member.id);
      
      const postsPoints = activity.postsCount * pointsPerPost;
      const eventsPoints = activity.eventsCount * pointsPerEvent;
      const totalPoints = baseQuota + postsPoints + eventsPoints;

      // Récupérer l'ancien solde depuis la DB locale
      const previousActivity = await this.prisma.memberActivity.findUnique({
        where: { communityId_memberId: { communityId, memberId: member.id } }
      });
      const previousPoints = previousActivity?.totalPoints ?? 0;
      const newPoints = totalPoints - previousPoints;

      this.logger.log(
        `  ↳ Membre ${member.name} (${member.id}) : ${activity.postsCount} posts, ${activity.eventsCount} events => ${totalPoints} pts au total (+${newPoints} nouveaux)`
      );

      if (newPoints > 0) {
        await this.klybApi.rewardUser(
          member.id,
          newPoints,
          `Points Open (diff): posts (${activity.postsCount}), events (${activity.eventsCount})`
        );
      }

      // Sauvegarder dans la DB locale
      await this.prisma.memberActivity.upsert({
        where: { communityId_memberId: { communityId, memberId: member.id } },
        update: { postsCount: activity.postsCount, eventsCount: activity.eventsCount, totalPoints },
        create: { communityId, memberId: member.id, postsCount: activity.postsCount, eventsCount: activity.eventsCount, totalPoints }
      });
    });

    await Promise.allSettled(rewardPromises);

    this.logger.log(
      `  🎉 ${members.length} membres traités pour la communauté ${communityId}.`
    );
  }
}

