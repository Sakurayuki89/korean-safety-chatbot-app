/**
 * @file lib/google-drive.ts
 * @description Google Drive API client for OAuth, file management, and utility functions.
 *
 * This module provides a comprehensive interface to interact with the Google Drive API,
 * including handling OAuth 2.0 authentication, token management (access and refresh),
 * and performing file operations like listing, downloading, and uploading.
 * It is designed to be used by the Next.js API routes.
 *
 * Based on the specifications in ARCHITECTURE_DESIGN.md.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// --- OAuth 2.0 Configuration ---

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error('Google OAuth credentials are not configured in .env.local');
}

/**
 * Scopes define the level of access the application is requesting.
 */
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

/**
 * Creates and configures an OAuth2 client instance.
 */
export const getOAuth2Client = (): OAuth2Client => {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
};

// --- Core API Client Functions ---

/**
 * Generates a URL for user consent.
 */
export const getAuthorizationUrl = (state: string): string => {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: state,
  });
};

/**
 * Exchanges an authorization code for access and refresh tokens.
 */
export const getTokens = async (code: string) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Creates an authenticated Google Drive API client.
 */
const getDriveClient = (accessToken: string) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

// --- File Management Functions ---

/**
 * Lists files from the user's Google Drive.
 */
export const listFiles = async (
  accessToken: string,
  options: {
    pageSize?: number;
    pageToken?: string;
    q?: string;
  }
) => {
  const drive = getDriveClient(accessToken);
  const { pageSize = 20, pageToken, q = "mimeType='application/pdf'" } = options;

  const query = {
    pageSize,
    pageToken,
    q,
    fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime)',
    orderBy: 'modifiedTime desc',
  };

  return await retryWithBackoff(async () => {
    const response = await drive.files.list(query);
    return response.data;
  });
};

/**
 * Downloads a file from Google Drive.
 */
export const downloadFile = async (accessToken: string, fileId: string) => {
  const drive = getDriveClient(accessToken);
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  return response.data;
};

/**
 * Uploads a file to Google Drive.
 */
export const uploadFile = async (
  accessToken: string,
  fileMetadata: { name: string; parents?: string[] },
  media: { mimeType: string; body: any }
) => {
  const drive = getDriveClient(accessToken);
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, mimeType, size, createdTime, modifiedTime',
  });
  return response.data;
};

// --- Utility and Error Handling ---

/**
 * A simple retry utility with exponential backoff.
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 500
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1 || ![429, 500, 502, 503, 504].includes(error.code)) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};
