/**
 * @file lib/constants.ts
 * @description Application-wide constants
 */

export const DB_NAME = 'korean-safety-chatbot';
export const COLLECTION_NAMES = {
  ANNOUNCEMENTS: 'announcements',
  CONTACTS: 'contacts',
  FEEDBACK: 'feedback',
  CHAT_HISTORY: 'chat_history',
  PDFS: 'managed_pdfs'
} as const;