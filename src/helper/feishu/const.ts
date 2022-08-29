import { getConfig } from '@/utils';
const { FEISHU_CONFIG } = getConfig();

// 飞书环境变量
export const APP_ID = FEISHU_CONFIG.FEISHU_APP_ID;
export const APP_SECRET = FEISHU_CONFIG.FEISHU_APP_SECRET;
