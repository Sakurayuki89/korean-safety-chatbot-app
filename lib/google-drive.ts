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

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';

// 폴더 관리 상수
const SAFE_CHATBOT_FOLDER = 'safe-chatbot';
const IMAGES_SUBFOLDER = 'images';
const SHEETS_SUBFOLDER = 'sheets';

// --- OAuth 2.0 Configuration ---

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '482118156786-hii1drd4icgnf1vk6crnnank8a2k18bg.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://korean-safety-chatbot-app.vercel.app/api/google/auth/stateless/callback';

// Only check credentials when functions are actually called, not at import time
function validateCredentials() {
  console.log('[google-drive] Validating credentials...');
  console.log('[google-drive] CLIENT_ID exists:', !!GOOGLE_CLIENT_ID);
  console.log('[google-drive] CLIENT_SECRET exists:', !!GOOGLE_CLIENT_SECRET);
  console.log('[google-drive] REDIRECT_URI:', GOOGLE_REDIRECT_URI);
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials (CLIENT_ID, CLIENT_SECRET) are not configured in .env.local');
  }
}

// Log the redirect URI for debugging (only if available)
if (GOOGLE_REDIRECT_URI) {
  console.log('[google-drive] GOOGLE_REDIRECT_URI:', GOOGLE_REDIRECT_URI);
}

/**
 * Scopes define the level of access the application is requesting.
 */
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

/**
 * Creates and configures an OAuth2 client instance.
 * If GOOGLE_REDIRECT_URI is not set, it will be dynamically constructed.
 */
export const getOAuth2Client = (req?: Request): OAuth2Client => {
  validateCredentials();
  let redirectUri = GOOGLE_REDIRECT_URI;
  
  // If no redirect URI is set in env, construct it from the request
  if (!redirectUri && req) {
    const url = new URL(req.url);
    redirectUri = `${url.protocol}//${url.host}/api/google/auth/callback`;
    console.log('[google-drive] Dynamically constructed redirect URI:', redirectUri);
  }
  
  if (!redirectUri) {
    throw new Error('GOOGLE_REDIRECT_URI not found and could not be constructed dynamically');
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    redirectUri
  );
};

// --- Core API Client Functions ---

/**
 * Generates a URL for user consent.
 */
export const getAuthorizationUrl = (state: string, req?: Request): string => {
  const oauth2Client = getOAuth2Client(req);
  console.log('[google-drive] Generating auth URL...');
  console.log('[google-drive] Using redirect URI:', oauth2Client.redirectUri);
  console.log('[google-drive] Using client ID:', oauth2Client._clientId);
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: state,
  });
  
  console.log('[google-drive] Generated OAuth URL:', authUrl);
  return authUrl;
};

/**
 * Exchanges an authorization code for access and refresh tokens.
 */
export const getTokens = async (code: string, req?: Request) => {
  const oauth2Client = getOAuth2Client(req);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Validates and refreshes access token if needed
 */
export const validateAndRefreshToken = async (tokens: Credentials) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  
  try {
    if (!tokens.access_token) {
      throw new Error('Access token not found in credentials');
    }
    // Check if token is valid by making a simple API call
    const tokenInfo = await oauth2Client.getTokenInfo(tokens.access_token);
    
    // If token expires within 5 minutes, refresh it
    const expiresIn = tokenInfo.expiry_date ? tokenInfo.expiry_date - Date.now() : 0;
    if (expiresIn < 5 * 60 * 1000) { // 5 minutes in milliseconds
      console.log('[google-drive] Token expires soon, refreshing...');
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials;
    }
    
    return tokens;
  } catch (error) {
    console.error('[google-drive] Token validation failed:', error);
    
    // Try to refresh the token
    if (tokens.refresh_token) {
      try {
        console.log('[google-drive] Attempting to refresh token...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        return credentials;
      } catch (refreshError) {
        console.error('[google-drive] Token refresh failed:', refreshError);
        throw new Error('Authentication required: Token expired and refresh failed');
      }
    }
    
    throw new Error('Authentication required: Invalid token and no refresh token available');
  }
};

/**
 * Creates an authenticated Google Drive API client.
 */
export const getDriveClient = (accessToken: string) => {
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
 * Uploads a file to a specified folder in Google Drive.
 */
export const uploadFileToDrive = async (
  accessToken: string,
  fileMetadata: { name: string; parents?: string[] },
  media: { mimeType: string; body: NodeJS.ReadableStream | string }
) => {
  const drive = getDriveClient(accessToken);
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  });
  return response.data.id;
};

/**
 * Sets file permissions to public and returns the direct download link.
 */
export const getPublicUrl = async (accessToken: string, fileId: string): Promise<string | null> => {
  const drive = getDriveClient(accessToken);
  try {
    console.log(`[getPublicUrl] Making file ${fileId} publicly readable...`);
    
    // First check if file exists and we have access
    try {
      const fileInfo = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, permissions'
      });
      console.log(`[getPublicUrl] File exists:`, fileInfo.data.name);
    } catch (fileError) {
      console.error(`[getPublicUrl] Cannot access file:`, fileError);
      throw fileError;
    }
    
    // Make the file publicly readable
    const permissionResult = await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });
    
    console.log(`[getPublicUrl] Permission created:`, permissionResult.data);

    // Wait a moment for permission to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return direct download URL
    const directUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    console.log(`[getPublicUrl] Generated direct URL: ${directUrl}`);
    
    return directUrl;

  } catch (error) {
    console.error('[getPublicUrl] Error making file public:', error);
    
    // Try alternative URL format
    console.log(`[getPublicUrl] Fallback: trying alternative URL format`);
    return `https://drive.google.com/uc?id=${fileId}`;
  }
};

/**
 * Deletes a file from Google Drive.
 */
export const deleteFileFromDrive = async (accessToken: string, fileId: string): Promise<void> => {
  const drive = getDriveClient(accessToken);
  try {
    console.log(`[deleteFileFromDrive] Deleting file ${fileId} from Google Drive...`);
    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
    });
    console.log(`[deleteFileFromDrive] File ${fileId} deleted successfully.`);
  } catch (error) {
    console.error(`[deleteFileFromDrive] Error deleting file ${fileId}:`, error);
    // It's possible the file is already deleted or permissions are wrong.
    // We'll log the error but not throw, to allow DB deletion to proceed.
  }
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
    } catch (error: unknown) {
      const err = error as { code?: number };
      if (i === maxRetries - 1 || !err.code || ![429, 500, 502, 503, 504].includes(err.code)) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
};

// --- 폴더 관리 함수 ---

/**
 * Google Drive에서 폴더를 찾거나 생성하는 함수
 */
export const findOrCreateFolder = async (
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string> => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // 기존 폴더 검색
  const searchQuery = parentFolderId 
    ? `name='${folderName}' and parents in '${parentFolderId}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  try {
    const existingFolders = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name)',
      supportsAllDrives: true,
    });

    // 기존 폴더가 있으면 반환
    if (existingFolders.data.files && existingFolders.data.files.length > 0) {
      const folderId = existingFolders.data.files[0].id;
      console.log(`[findOrCreateFolder] Found existing folder: ${folderName} (ID: ${folderId})`);
      return folderId!;
    }

    // 폴더가 없으면 생성
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined,
    };

    const createdFolder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
      supportsAllDrives: true,
    });

    const folderId = createdFolder.data.id;
    console.log(`[findOrCreateFolder] Created new folder: ${folderName} (ID: ${folderId})`);
    return folderId!;
  } catch (error) {
    console.error(`[findOrCreateFolder] Error with folder ${folderName}:`, error);
    throw error;
  }
};

/**
 * safe-chatbot 폴더 구조 생성/확인
 */
export const ensureSafeChatbotFolders = async (accessToken: string) => {
  console.log('[ensureSafeChatbotFolders] Setting up folder structure...');
  
  // 1. 메인 safe-chatbot 폴더 생성/확인
  const mainFolderId = await findOrCreateFolder(accessToken, SAFE_CHATBOT_FOLDER);
  
  // 2. images 서브폴더 생성/확인
  const imagesFolderId = await findOrCreateFolder(accessToken, IMAGES_SUBFOLDER, mainFolderId);
  
  // 3. sheets 서브폴더 생성/확인
  const sheetsFolderId = await findOrCreateFolder(accessToken, SHEETS_SUBFOLDER, mainFolderId);
  
  console.log(`[ensureSafeChatbotFolders] Folder structure ready:
    - Main: ${mainFolderId}
    - Images: ${imagesFolderId}
    - Sheets: ${sheetsFolderId}`);
  
  return {
    mainFolderId,
    imagesFolderId,
    sheetsFolderId,
  };
};
