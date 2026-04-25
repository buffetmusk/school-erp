/**
 * SMS and WhatsApp Integration Service
 * 
 * This module provides SMS and WhatsApp messaging capabilities using Twilio API.
 * For production use, set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment variables.
 * 
 * Alternative free/open-source options:
 * - Termux (Android-based SMS gateway)
 * - Gammu (Linux SMS gateway with USB modem)
 * - For WhatsApp: Use WhatsApp Business API or unofficial libraries like whatsapp-web.js
 */

import { ENV } from './env';

export interface SMSConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string; // WhatsApp-enabled Twilio number
}

export interface SendMessageParams {
  to: string; // Phone number in E.164 format (+919876543210)
  message: string;
  channel: 'sms' | 'whatsapp';
}

export interface MessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: string;
}

/**
 * Send SMS using Twilio API
 */
export async function sendSMS(params: SendMessageParams): Promise<MessageResult> {
  const { to, message } = params;

  // Check if Twilio credentials are configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[SMS] Twilio credentials not configured. Message not sent.');
    console.log('[SMS] Would send to:', to, 'Message:', message);
    
    // In development, simulate success
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        messageId: `dev-${Date.now()}`,
        deliveryStatus: 'simulated',
      };
    }
    
    return {
      success: false,
      error: 'SMS service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.',
    };
  }

  try {
    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[SMS] Twilio API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send SMS',
      };
    }

    console.log('[SMS] Message sent successfully:', data.sid);
    return {
      success: true,
      messageId: data.sid,
      deliveryStatus: data.status,
    };
  } catch (error) {
    console.error('[SMS] Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send WhatsApp message using Twilio API
 */
export async function sendWhatsApp(params: SendMessageParams): Promise<MessageResult> {
  const { to, message } = params;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[WhatsApp] Twilio credentials not configured. Message not sent.');
    console.log('[WhatsApp] Would send to:', to, 'Message:', message);
    
    // In development, simulate success
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        messageId: `dev-wa-${Date.now()}`,
        deliveryStatus: 'simulated',
      };
    }
    
    return {
      success: false,
      error: 'WhatsApp service not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER environment variables.',
    };
  }

  try {
    // Twilio WhatsApp endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    // WhatsApp numbers must be prefixed with 'whatsapp:'
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const whatsappFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: whatsappTo,
        From: whatsappFrom,
        Body: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp] Twilio API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send WhatsApp message',
      };
    }

    console.log('[WhatsApp] Message sent successfully:', data.sid);
    return {
      success: true,
      messageId: data.sid,
      deliveryStatus: data.status,
    };
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Main function to send message via SMS or WhatsApp
 */
export async function sendMessage(params: SendMessageParams): Promise<MessageResult> {
  if (params.channel === 'whatsapp') {
    return sendWhatsApp(params);
  } else {
    return sendSMS(params);
  }
}

/**
 * Format phone number to E.164 format
 * Assumes Indian numbers if no country code provided
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If already has country code (starts with 91 and is 12 digits)
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  // If 10 digits, assume Indian number
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  // If starts with 0, remove it and add +91
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+91${cleaned.substring(1)}`;
  }
  
  // Return as is with + prefix
  return `+${cleaned}`;
}

/**
 * Replace template variables in message content
 * Variables format: {variableName}
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value));
  }
  
  return result;
}
