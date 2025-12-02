import logger from "@/lib/logger/server";

/**
 * Sends a message to a Lark webhook.
 * @param message The message to send.
 * @returns A promise that resolves when the message has been sent.
 */
interface LarkResponse {
  code: number;
  msg: string;
  data?: unknown;
}

/**
 * Sends a message to a Lark webhook with improved error handling and retry logic.
 * @param message The message to send
 * @param retryCount Optional number of retries (default: 2)
 * @returns Promise resolving to success status
 * @throws Error if all retries fail
 */
export async function sendLarkMessage(
  message: string,
  retryCount = 2,
): Promise<boolean> {
  const webhookUrl = process.env.LARK_WEBHOOK_URL;
  const maxRetries = Math.max(0, retryCount);
  const retryDelays = [1000, 3000, 5000]; // Increasing delays for retries

  if (!webhookUrl) {
    logger.error('LARK_WEBHOOK_URL is not set. Cannot send message to Lark.');
    return false;
  }

  if (!message || typeof message !== 'string') {
    logger.error(
      'Invalid message format. Message must be a non-empty string.',
    );
    return false;
  }

  const payload = {
    msg_type: 'interactive',
    card: {
      header: {
        title: {
          content: "New Feedback/Bug Report",
          tag: "plain_text",
        },
      },
      elements: [
        {
          tag: "div",
          text: {
            content: message,
            tag: "lark_md",
          },
        },
      ],
    },
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => 'Failed to read error response');
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as LarkResponse;
      if (data.code !== 0) {
        throw new Error(`Lark API error: ${data.msg}`);
      }

      return true;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error(
        { attempt, maxRetries, errorMessage },
        `Lark message ${isLastAttempt ? 'failed' : 'attempt failed'} `,
      );

      if (isLastAttempt) {
        logger.error({
          message: message, // Use the message directly for logging as well
          error: errorMessage,
        }, 'All Lark message attempts failed');
        return false;
      }

      // Wait before retrying, with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelays[attempt] || 5000),
      );
    }
  }

  return false;
}
