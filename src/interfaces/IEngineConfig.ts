import { IBaseStats } from './IBaseStats';

export type IStatsModifiers = { [stat in keyof IBaseStats]: number };

export interface IEngineConfig {
  statPointsPerLevel: number;
  statsModifiers: IStatsModifiers;
}
