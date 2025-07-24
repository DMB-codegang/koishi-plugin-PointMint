import { Context, Logger } from 'koishi'

import { PointDB, PointDB_log } from './types';

import { registerCommands } from './handlers/commands'
import { PointService } from './services/pointService';

export const name = 'pointmint'
export const description = '模块化架构｜可审计事务追踪｜实时积分生态 - 基于双效校验机制的经济引擎'
export const log = new Logger("@DMB-codegang/pointmint");
export const inject = {
  required: ['database']
}
export const database_name = 'PointDB';
export const database_name_log = 'PointDB_log';

import { Config } from './config'
export * from './config'

declare module 'koishi' {
  interface Tables {
    PointDB: PointDB
    PointDB_log: PointDB_log
  }
  interface Context {
    points: PointService
  }
}

export function apply(ctx: Context, cfg: Config) {
  ctx.plugin(PointService, cfg)
  const points = new PointService(ctx, cfg) // 通过实例化解决koishi报inject中没有服务points的警告
  if (cfg.auto_log_username && cfg.auto_log_username_type === 'all') {
    ctx.on('message', async (session) => {
      const username = session.username
      const database_username = await ctx.database.get(database_name, { userid: session.userId })
      if (database_username.length === 0 || database_username[0].username !== username) {
        await points.set(session.userId, username, 0, name)//更新用户名
      }
    })
  }
  registerCommands(ctx, points, cfg)
}


