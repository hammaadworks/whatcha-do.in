# How to Use the Structured Logging System

This project uses `pino` for structured, high-performance logging. This guide explains how to use the logging system to ensure consistency and get detailed, readable logs during development.

## The `withLogging` Wrapper (Preferred Method)

For most server-side functions, the easiest and most consistent way to add logging is to use the `withLogging` higher-order function. It automatically logs:
-   Function entry with arguments.
-   Function exit with results (for both sync and async functions).
-   Any errors thrown by the function, including the stack trace.

### How to Use It

1.  **Import `withLogging`:** Add the import to the top of your file.
2.  **Define Your Core Function:** Write your function as you normally would, with a leading underscore in its name (e.g., `_myFunction`).
3.  **Wrap and Export:** Export a new constant which is your core function wrapped by `withLogging`. Pass the function itself and its name as a string.

### Example: `lib/supabase/user.server.ts`

```typescript
// lib/supabase/user.server.ts
import { withLogging } from '../logger/withLogging';
import logger from '../logger/server';

// 1. The core logic is in a private, "unwrapped" function.
async function _getUserByUsernameServer(username: string): Promise<PublicUserDisplay | null> {
    const supabase = await createServerSideClient();
    const { data, error } = await supabase
        .from('users')
        .select('id, username, bio')
        .eq('username', username)
        .single();

    if (error && error.code !== 'PGRST116') {
        logger.error({ err: error, username }, 'Error fetching user by username');
        return null;
    }
    return data as PublicUserDisplay;
}

// 2. The exported function is the wrapped version.
//    Anywhere else in the app that imports 'getUserByUsernameServer' gets the logged version.
export const getUserByUsernameServer = withLogging(_getUserByUsernameServer, 'getUserByUsernameServer');
```

## Manual Logging

If you need more granular logging inside a function, you can import the server logger directly.

### How to Use It

1.  **Import `logger`:** `import logger from '@/lib/logger/server';`
2.  **Use Logger Methods:** The logger has methods for different levels: `debug`, `info`, `warn`, and `error`.
3.  **Pass an Object:** Always pass an object as the first argument. This ensures the log is structured. You can add any relevant variables to this object. A short message can be the second argument.

### Example

```typescript
import logger from '@/lib/logger/server';

function processComplexData(data) {
  const log = logger.child({ function: 'processComplexData' });

  log.info({ recordCount: data.length }, 'Starting complex data processing.');

  for (const record of data) {
    if (record.status === 'invalid') {
      log.warn({ recordId: record.id }, 'Found invalid record.');
    }
  }
  log.info('Finished processing.');
}
```

## Viewing Logs in Development

The development server is configured to automatically format these logs for readability.

1.  **Run the server:**
    ```bash
    pnpm dev
    ```
2.  **Observe your terminal:** When a function wrapped with `withLogging` is executed, you will see colorized, pretty-printed logs showing the function flow, arguments, and results.
