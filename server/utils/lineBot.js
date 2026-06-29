import * as line from '@line/bot-sdk';
import dotenv from 'dotenv';
dotenv.config();

// LINE Bot Client — initialized lazily so missing env vars don't crash startup
let _client = null;

const getClient = () => {
  if (!_client) {
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!channelAccessToken) {
      console.warn('[lineBot] LINE_CHANNEL_ACCESS_TOKEN is not set. LINE push notifications are disabled.');
      return null;
    }
    _client = new line.messagingApi.MessagingApiClient({ channelAccessToken });
  }
  return _client;
};

/**
 * Build a Flex Message bubble for task review notification.
 */
const buildTaskFlexMessage = (task, childName, token) => ({
  type: 'flex',
  altText: `🏆 ${childName} 完成了任務「${task.name}」，等待您審核！`,
  contents: {
    type: 'bubble',
    size: 'kilo',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '📋 任務完成審核',
          color: '#ffffff',
          size: 'sm',
          weight: 'bold',
        },
      ],
      backgroundColor: '#3661FF',
      paddingAll: '14px',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        {
          type: 'text',
          text: `🧒 ${childName} 完成了任務！`,
          weight: 'bold',
          size: 'md',
          color: '#1a1a2e',
          wrap: true,
        },
        {
          type: 'separator',
          margin: 'sm',
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          margin: 'md',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: '📌 任務', size: 'sm', color: '#666666', flex: 2 },
                { type: 'text', text: task.name || '未命名任務', size: 'sm', color: '#111111', flex: 5, wrap: true, weight: 'bold' },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: '⭐ 點數', size: 'sm', color: '#666666', flex: 2 },
                { type: 'text', text: `${task.points || 0} 點`, size: 'sm', color: '#FF9F1C', flex: 5, weight: 'bold' },
              ],
            },
            ...(task.category ? [{
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: '🏷️ 類型', size: 'sm', color: '#666666', flex: 2 },
                { type: 'text', text: task.category, size: 'sm', color: '#444444', flex: 5 },
              ],
            }] : []),
          ],
        },
      ],
      paddingAll: '16px',
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          action: {
            type: 'postback',
            label: '✅ 批准給分',
            data: `action=approve_task&taskId=${task.id}&token=${token}`,
            displayText: '批准此任務',
          },
          style: 'primary',
          color: '#00C851',
          height: 'sm',
        },
        {
          type: 'button',
          action: {
            type: 'postback',
            label: '❌ 拒絕',
            data: `action=reject_task&taskId=${task.id}&token=${token}`,
            displayText: '拒絕此任務',
          },
          style: 'primary',
          color: '#FF4444',
          height: 'sm',
        },
      ],
      paddingAll: '12px',
    },
    styles: {
      body: { backgroundColor: '#F8F9FF' },
      footer: { backgroundColor: '#F0F2FF' },
    },
  },
});

/**
 * Build a Flex Message bubble for redeem review notification.
 */
const buildRedeemFlexMessage = (item, childName, currentPoints, token) => ({
  type: 'flex',
  altText: `🎁 ${childName} 想兌換「${item.name}」，等待您核銷！`,
  contents: {
    type: 'bubble',
    size: 'kilo',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '🎁 兌換獎勵審核',
          color: '#ffffff',
          size: 'sm',
          weight: 'bold',
        },
      ],
      backgroundColor: '#FF9F1C',
      paddingAll: '14px',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        {
          type: 'text',
          text: `🧒 ${childName} 想兌換獎勵！`,
          weight: 'bold',
          size: 'md',
          color: '#1a1a2e',
          wrap: true,
        },
        {
          type: 'separator',
          margin: 'sm',
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          margin: 'md',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: '🎀 獎勵', size: 'sm', color: '#666666', flex: 2 },
                { type: 'text', text: item.name || '未命名獎勵', size: 'sm', color: '#111111', flex: 5, wrap: true, weight: 'bold' },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: '💰 花費', size: 'sm', color: '#666666', flex: 2 },
                { type: 'text', text: `${item.pointCost || item.point_cost || 0} 點`, size: 'sm', color: '#FF4444', flex: 5, weight: 'bold' },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type: 'text', text: '🏦 現有', size: 'sm', color: '#666666', flex: 2 },
                { type: 'text', text: `${currentPoints || 0} 點`, size: 'sm', color: '#00C851', flex: 5 },
              ],
            },
          ],
        },
      ],
      paddingAll: '16px',
    },
    footer: {
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          action: {
            type: 'postback',
            label: '✅ 核銷',
            data: `action=approve_redeem&inventoryId=${item.inventoryId || item.id}&token=${token}`,
            displayText: '核銷此兌換',
          },
          style: 'primary',
          color: '#00C851',
          height: 'sm',
        },
        {
          type: 'button',
          action: {
            type: 'postback',
            label: '❌ 拒絕',
            data: `action=reject_redeem&inventoryId=${item.inventoryId || item.id}&token=${token}`,
            displayText: '拒絕此兌換',
          },
          style: 'primary',
          color: '#FF4444',
          height: 'sm',
        },
      ],
      paddingAll: '12px',
    },
    styles: {
      body: { backgroundColor: '#FFFAF0' },
      footer: { backgroundColor: '#FFF5E0' },
    },
  },
});

/**
 * Send a task review request to the parent via LINE Bot.
 * @param {string} parentLineId - The parent's LINE user ID
 * @param {object} task - Task object with id, name, points, category
 * @param {string} childName - Child's display name
 * @param {string} reviewToken - One-time security token stored in DB
 */
export const sendTaskReviewRequest = async (parentLineId, task, childName, reviewToken) => {
  const client = getClient();
  if (!client || !parentLineId) return;

  try {
    await client.pushMessage({
      to: parentLineId,
      messages: [buildTaskFlexMessage(task, childName, reviewToken)],
    });
    console.log(`[lineBot] Task review notification sent to LINE user ${parentLineId}`);
  } catch (err) {
    console.error('[lineBot] Failed to send task review notification:', err?.response?.data || err.message);
  }
};

/**
 * Send a redeem review request to the parent via LINE Bot.
 * @param {string} parentLineId - The parent's LINE user ID
 * @param {object} item - Inventory item with id, name, pointCost
 * @param {string} childName - Child's display name
 * @param {number} currentPoints - Child's current total points
 * @param {string} reviewToken - One-time security token stored in DB
 */
export const sendRedeemReviewRequest = async (parentLineId, item, childName, currentPoints, reviewToken) => {
  const client = getClient();
  if (!client || !parentLineId) return;

  try {
    await client.pushMessage({
      to: parentLineId,
      messages: [buildRedeemFlexMessage(item, childName, currentPoints, reviewToken)],
    });
    console.log(`[lineBot] Redeem review notification sent to LINE user ${parentLineId}`);
  } catch (err) {
    console.error('[lineBot] Failed to send redeem review notification:', err?.response?.data || err.message);
  }
};

/**
 * Send an encouragement message to the child via LINE Bot.
 * @param {string} childLineId - The child's LINE user ID
 * @param {string} message - Custom encouragement message from parent
 * @param {string} parentName - Parent's name for display
 */
export const sendEncouragementToChild = async (childLineId, message, parentName) => {
  const client = getClient();
  if (!client || !childLineId) return;

  try {
    await client.pushMessage({
      to: childLineId,
      messages: [{
        type: 'flex',
        altText: `💌 來自 ${parentName} 的鼓勵！`,
        contents: {
          type: 'bubble',
          size: 'kilo',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: `💌 來自 ${parentName} 的鼓勵！`,
              color: '#ffffff',
              size: 'sm',
              weight: 'bold',
            }],
            backgroundColor: '#7c3aed',
            paddingAll: '14px',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [{
              type: 'text',
              text: message,
              wrap: true,
              size: 'md',
              color: '#1a1a2e',
              weight: 'bold',
            }],
            paddingAll: '18px',
          },
          styles: { body: { backgroundColor: '#F5F0FF' } },
        },
      }],
    });
    console.log(`[lineBot] Encouragement sent to child ${childLineId}`);
  } catch (err) {
    console.error('[lineBot] Failed to send encouragement:', err?.response?.data || err.message);
  }
};

/**
 * Verify a LINE webhook signature.
 * @param {string} rawBody - Raw request body string
 * @param {string} signature - X-Line-Signature header value
 */
export const validateSignature = (rawBody, signature) => {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) return false;
  return line.validateSignature(rawBody, channelSecret, signature);
};
