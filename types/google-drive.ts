/**
 * @file types/google-drive.ts
 * @description TypeScript types for the Google Drive integration.
 *
 * This file distinguishes between the raw API response from Google (`ApiDriveFile`)
 * and the data model used for storage in MongoDB (`MongoDbDriveFile`).
 */

import { ObjectId } from 'mongodb';

/**
 * Represents the basic file structure returned from the Google Drive API v3 files.list method.
 * This is used for client-side operations.
 */
export interface ApiDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string; // size is returned as string from the API
  createdTime: string;
  modifiedTime: string;
}

/**
 * Represents a file record as it is stored in MongoDB.
 * It includes additional metadata for local application use.
 */
export interface MongoDbDriveFile {
  _id: ObjectId;          // MongoDB document ID
  userId: string;           // Local user identifier
  driveFileId: string;      // Google Drive's unique file ID
  name: string;
  mimeType: string;
  size: number;             // Stored as a number
  createdTime: Date;        // Stored as a Date object
  modifiedTime: Date;       // Stored as a Date object
  localCreatedAt: Date;     // Timestamp when the file was first saved to our DB
  lastAccessedAt: Date;     // Timestamp of the last time the user accessed it
  isActive: boolean;        // Flag to indicate if the file is currently in use or active
}

/**
 * Represents the structure of user tokens stored for accessing Google APIs.
 */
export interface GoogleToken {
  access_token: string;
  refresh_token?: string; // A refresh token is not always provided
  scope: string;
  token_type: 'Bearer';
  expiry_date: number;
}

/**
 * Represents a user session, potentially containing Google authentication data
 * and information about the user's current activity.
 */
export interface UserSession {
  _id: ObjectId;
  sessionId: string;
  googleToken?: GoogleToken;
  currentFile?: {
    driveFileId: string;
    fileName: string;
    currentPage: number;
  };
  createdAt: Date;
  lastActiveAt: Date;
}
