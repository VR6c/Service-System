import { StorageService } from './storageService';

export interface TelegramReminderPayload {
  customer_name: string;
  vehicle_model: string;
  plate_no: string;
  remind_date: string;
  phone: string;
}

export const sendTelegramReminder = async (payload: TelegramReminderPayload): Promise<{ success: boolean; message: string }> => {
  const settings = StorageService.getSettings();
  const botToken = settings.telegram_bot_token?.trim();
  const chatId = settings.telegram_chat_id?.trim();

  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'Telegram Bot Token or Group Chat ID is not configured. Please configure your Telegram Bot Token and Chat ID in Settings first.'
    };
  }

  const messageText = 
    `🔔 *CUSTOMER SERVICE REPAIR REMINDER*\n\n` +
    `- Customer Name : ${payload.customer_name || 'N/A'}\n` +
    `- Car Model : ${payload.vehicle_model || 'N/A'}\n` +
    `- Plate Number : ${payload.plate_no || 'N/A'}\n` +
    `- Date : ${payload.remind_date || 'N/A'}\n` +
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
      return { success: true, message: 'Telegram reminder sent successfully to the group!' };
    } else {
      return { success: false, message: `Telegram Error: ${data.description || 'Unknown error'}` };
    }
  } catch (err: any) {
    return { success: false, message: `Network error: ${err.message || 'Failed to connect to Telegram API'}` };
  }
};

export const testTelegramBotConnection = async (botToken: string, chatId: string): Promise<{ success: boolean; message: string }> => {
  if (!botToken || !chatId) {
    return { success: false, message: 'Please enter both Bot Token and Chat ID to test.' };
  }

  const testMessage = `🤖 *TEST NOTIFICATION FROM SERVICE SYSTEM*\n\n✅ Telegram Bot integration is working properly!`;

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
      return { success: true, message: 'Test message sent successfully! Check your Telegram group.' };
    } else {
      return { success: false, message: `Telegram API Error: ${data.description}` };
    }
  } catch (err: any) {
    return { success: false, message: `Connection Failed: ${err.message}` };
  }
};
