// Request Logging Middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '[REDACTED]';
    console.log('Body:', JSON.stringify(safeBody, null, 2));
  }
  
  // Log query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query:', req.query);
  }
  
  // Listen for response finish event
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] Completed ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms\n`);
  });
  
  next();
};
