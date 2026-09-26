import { StorageService } from './storageService';

export interface TelegramReminderPayload {
  customer_name: string;
  vehicle_model: string;
  plate_no: string;
  remind_date?: string;
  phone: string;
  branch_name?: string;
  status?: string;
  receipt_no?: string;
}

// 1. Services Complete Dispatcher
export const sendTelegramComplete = async (payload: TelegramReminderPayload): Promise<{ success: boolean; message: string }> => {
  const settings = StorageService.getSettings();
  const botToken = settings.telegram_bot_token?.trim();
  const chatId = (settings.telegram_complete_chat_id || settings.telegram_chat_id)?.trim();

  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'Services Complete Telegram Group Chat ID or Bot Token is not configured. Please check Settings.'
    };
  }

  const branchDisplay = payload.branch_name?.trim() || settings.branch_name || 'N/A';
  const dateDisplay = payload.remind_date || new Date().toISOString().split('T')[0];

  const messageText = 
    `✅ *CUSTOMER SERVICES COMPLETE*\n\n` +
    `- Customer Name : ${payload.customer_name || 'N/A'}\n` +
    `- Branch : ${branchDisplay}\n` +
    `- Car Model : ${payload.vehicle_model || 'N/A'}\n` +
    `- Plate Number : ${payload.plate_no || 'N/A'}\n` +
    `- Date : ${dateDisplay}\n` +
    `- Phone Number : ${payload.phone || 'N/A'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'Services Complete notification sent successfully to Telegram group!' };
    } else {
      return { success: false, message: `Telegram Error: ${data.description || 'Unknown error'}` };
    }
  } catch (err: any) {
    return { success: false, message: `Network error: ${err.message || 'Failed to connect to Telegram API'}` };
  }
};

// 2. Services Reminder Dispatcher
export const sendTelegramReminder = async (payload: TelegramReminderPayload): Promise<{ success: boolean; message: string }> => {
  const settings = StorageService.getSettings();
  const botToken = settings.telegram_bot_token?.trim();
  const chatId = (settings.telegram_reminder_chat_id || settings.telegram_chat_id)?.trim();

  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'Services Reminder Telegram Group Chat ID or Bot Token is not configured. Please check Settings.'
    };
  }

  const branchDisplay = payload.branch_name?.trim() || settings.branch_name || 'N/A';
  const dateDisplay = payload.remind_date || new Date().toISOString().split('T')[0];

  const messageText = 
    `🔔 *CUSTOMER SERVICES REMINDER*\n\n` +
    `- Customer Name : ${payload.customer_name || 'N/A'}\n` +
    `- Branch : ${branchDisplay}\n` +
    `- Car Model : ${payload.vehicle_model || 'N/A'}\n` +
    `- Plate Number : ${payload.plate_no || 'N/A'}\n` +
    `- Date : ${dateDisplay}\n` +
    `- Phone Number : ${payload.phone || 'N/A'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'Services Reminder sent successfully to Telegram group!' };
    } else {
      return { success: false, message: `Telegram Error: ${data.description || 'Unknown error'}` };
    }
  } catch (err: any) {
    return { success: false, message: `Network error: ${err.message || 'Failed to connect to Telegram API'}` };
  }
};

// Connection Tester for specific group
export const testTelegramBotConnection = async (
  botToken: string, 
  chatId: string, 
  groupName: string = 'General Group', 
  branchName?: string
): Promise<{ success: boolean; message: string }> => {
  if (!botToken || !chatId) {
    return { success: false, message: `Please enter both Bot Token and ${groupName} Chat ID to test.` };
  }

  const branchLine = branchName ? `- Branch : ${branchName}\n` : '';
  const testMessage = 
    `🤖 *TEST NOTIFICATION FROM SERVICE SYSTEM*\n\n` +
    `📁 *Group*: ${groupName}\n` +
    branchLine +
    `✅ Telegram Bot integration is working properly!`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: testMessage,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: `Test message sent successfully to "${groupName}"! Check your Telegram.` };
    } else {
      return { success: false, message: `Telegram API Error: ${data.description}` };
    }
  } catch (err: any) {
    return { success: false, message: `Connection Failed: ${err.message}` };
  }
};
