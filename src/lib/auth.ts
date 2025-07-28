// src/lib/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'a-very-weak-and-predictable-secret';

// A09 Security Logging and Monitoring Failures - Minimal logging system
// WARNING: This logging implementation demonstrates poor security practices:
// - No IP addresses or user agents logged (missing context for incident response)
// - No detailed failure reasons (makes forensic analysis difficult)
// - Basic file logging without rotation (can cause storage issues)
// - No alerting or monitoring integration
// - Missing security event categorization
export const logLoginEvent = async (message: string) => {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logsDir, { recursive: true });
    
    const logPath = path.join(logsDir, 'logs.txt');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    
    await fs.appendFile(logPath, logEntry, 'utf-8');
  } catch (error) {
    // Even error logging is minimal - in production this could hide critical issues
    console.error('Failed to write log:', error);
  }
};

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export const authMiddleware = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void | NextApiResponse> | void | NextApiResponse) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (req as AuthenticatedRequest).user = decoded as AuthenticatedRequest['user'];
      return handler(req as AuthenticatedRequest, res);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};
