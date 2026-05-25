declare global {
  namespace Express {
    interface Request {
      resolvedSchema: string;
    }
  }
}

export {};
