"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsModule = void 0;
const common_1 = require("@nestjs/common");
const clubz_api_service_1 = require("./clubz-api.service");
const points_service_1 = require("./points.service");
const stats_controller_1 = require("./stats.controller");
const prisma_service_1 = require("../prisma/prisma.service");
let PointsModule = class PointsModule {
};
exports.PointsModule = PointsModule;
exports.PointsModule = PointsModule = __decorate([
    (0, common_1.Module)({
        controllers: [stats_controller_1.StatsController],
        providers: [clubz_api_service_1.ClubzApiService, points_service_1.PointsService, prisma_service_1.PrismaService],
    })
], PointsModule);
