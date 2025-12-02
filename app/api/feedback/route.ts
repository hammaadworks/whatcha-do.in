import { NextRequest, NextResponse } from "next/server";
import { sendLarkMessage } from "@/lib/lark";
import { withLogging } from "@/lib/logger/withLogging";
import logger from "@/lib/logger/server";
import * as z from "zod";

const formSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters long.").max(500, "Message must be at most 500 characters long."),
  contactMethod: z.enum(["email", "whatsapp", "link"], {
    errorMap: () => ({ message: "Invalid contact method selected." }),
  }),
  contactDetail: z.string().min(1, "Contact detail cannot be empty."),
}).superRefine((data, ctx) => {
  if (data.contactMethod === "email") {
    if (!z.string().email().safeParse(data.contactDetail).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid email address format.",
        path: ["contactDetail"],
      });
    }
  } else if (data.contactMethod === "whatsapp") {
    if (!/^\+?[0-9]+$/.test(data.contactDetail)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid WhatsApp number format. Must contain only digits and an optional '+' prefix.",
        path: ["contactDetail"],
      });
    }
  } else if (data.contactMethod === "link") {
    if (!z.string().url().safeParse(data.contactDetail).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid URL format.",
        path: ["contactDetail"],
      });
    }
  }
});

async function _POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = formSchema.parse(body);

    const { message, contactMethod, contactDetail } = validatedData;

    const larkPrefix = process.env.LARK_MESSAGE_PREFIX || '';
    const env = process.env.NODE_ENV || 'development';
    const envTag = `[${env}]`;

    const rawLarkMessageContent = `

**Message:**
${message}

**Contact Method:** ${contactMethod}
**Contact Detail:** ${contactDetail}
    `;

    // Construct the final message as per user's format request: {prefix}\n{message}
    // where {message} now includes the environment tag at its beginning.
    const finalLarkMessage = `${larkPrefix} ${envTag} ${rawLarkMessageContent}`;

    const success = await sendLarkMessage(finalLarkMessage);

    if (success) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send message to Lark." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      logger.error({ err: error.errors }, "Validation Error in feedback route");
      return NextResponse.json(
        { success: false, error: "Invalid request data.", details: error.errors },
        { status: 400 }
      );
    }
    logger.error({ err: error }, "API Error in feedback route");
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

export const POST = withLogging(_POST, "api.feedback.POST");
