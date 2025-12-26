import logger from "@/lib/logger/server";

/**
 * Represents a response from the Lark webhook API.
 */
interface LarkResponse {
    code: number;
    msg: string;
    data?: unknown;
}

const retryDelays = [1000, 3000, 5000];

/**
 * Pauses execution for the given duration.
 *
 * @param {number} ms - Duration to sleep in milliseconds.
 * @returns {Promise<void>} Promise that resolves after the delay.
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validates required inputs for sending a Lark message.
 *
 * @param {string} message - The message content to send.
 * @param {string | undefined} webhookUrl - Lark webhook URL.
 * @returns {boolean} True if inputs are valid, false otherwise.
 */
function validateInputs(message: string, webhookUrl?: string): boolean {
    if (!webhookUrl) {
        logger.error("LARK_WEBHOOK_URL is not set.");
        return false;
    }

    if (!message) {
        logger.error("Message must be a non-empty string.");
        return false;
    }

    return true;
}

/**
 * Builds the payload for a Lark interactive message.
 *
 * @param {string} message - Message content.
 * @returns {object} Lark webhook payload.
 */
function buildLarkPayload(message: string) {
    return {
        msg_type: "interactive", card: {
            header: {
                title: {
                    content: "New Feedback/Bug Report", tag: "plain_text",
                },
            }, elements: [{
                tag: "div", text: {
                    content: message, tag: "lark_md",
                },
            },],
        },
    };
}

/**
 * Performs a fetch request with a timeout.
 *
 * @param {string} url - Request URL.
 * @param {RequestInit} options - Fetch options.
 * @param {number} [timeoutMs=5000] - Timeout duration in milliseconds.
 * @returns {Promise<Response>} Fetch response.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 5000,): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options, signal: controller.signal,
        });
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Asserts that the HTTP response was successful.
 *
 * @param {Response} response - Fetch response.
 * @throws {Error} If the response status is not OK.
 */
async function assertHttpSuccess(response: Response): Promise<void> {
    if (response.ok) return;

    const text = await response.text().catch(() => "Failed to read response");
    throw new Error(`HTTP ${response.status}: ${text}`);
}

/**
 * Asserts that the Lark API response indicates success.
 *
 * @param {LarkResponse} data - Parsed Lark API response.
 * @throws {Error} If the Lark API returns an error code.
 */
function assertLarkSuccess(data: LarkResponse): void {
    if (data.code !== 0) {
        throw new Error(`Lark API error: ${data.msg}`);
    }
}

/**
 * Executes a single request to the Lark webhook.
 *
 * @param {string} webhookUrl - Lark webhook URL.
 * @param {unknown} payload - Message payload.
 * @returns {Promise<void>} Resolves when the request succeeds.
 * @throws {Error} If the request or API response fails.
 */
async function executeLarkRequest(webhookUrl: string, payload: unknown,): Promise<void> {
    const response = await fetchWithTimeout(webhookUrl, {
        method: "POST", headers: {
            "Content-Type": "application/json",
        }, body: JSON.stringify(payload),
    });

    await assertHttpSuccess(response);

    const data = (await response.json()) as LarkResponse;
    assertLarkSuccess(data);
}

/**
 * Retries an async operation with delay between attempts.
 *
 * @template T
 * @param {() => Promise<T>} fn - Async function to retry.
 * @param {number} retries - Number of retry attempts.
 * @returns {Promise<T>} Result of the successful operation.
 * @throws {unknown} Last error if all retries fail.
 */
async function retry<T>(fn: () => Promise<T>, retries: number,): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            logger.error({attempt, retries, error: String(error)}, "Retry attempt failed.",);

            if (attempt === retries) break;

            await sleep(retryDelays[attempt] ?? 5000);
        }
    }

    throw lastError;
}

/**
 * Sends a message to a Lark webhook with retry logic and error handling.
 *
 * @param {string} message - Message content to send.
 * @param {number} [retryCount=2] - Number of retry attempts.
 * @returns {Promise<boolean>} True if the message was sent successfully.
 */
export async function sendLarkMessage(message: string, retryCount = 2,): Promise<boolean> {
    const webhookUrl = process.env.LARK_WEBHOOK_URL;

    if (!validateInputs(message, webhookUrl)) {
        return false;
    }

    const payload = buildLarkPayload(message);

    try {
        await retry(() => executeLarkRequest(webhookUrl!, payload), Math.max(0, retryCount),);
        return true;
    } catch (error) {
        logger.error({message, error: String(error)}, "All Lark message attempts failed.",);
        return false;
    }
}
