import { task, queue, wait } from "@trigger.dev/sdk/v3";
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailQueue = queue({
  name: "test-email-queue",
  concurrencyLimit: 5,
});

interface BatchEmailPayload {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  react?: string;
  cc?: string[];
  bcc?: string[];
  reply_to?: string[];
  headers?: Record<string, string>;
}

export const sendEmails = task({
  id: "send-test-emails",
  queue: emailQueue,
  run: async (payload: { emails: BatchEmailPayload[] }) => {
    const { emails } = payload;
    const results = [];

    const emailsWithHeaders = emails.map((email) => ({
      ...email,
      headers: {
        "X-Entity-Ref-ID": uuidv4(),
        "X-Entity-Church-Space-Test": "true",
        ...email.headers,
      },
    }));

    if (emailsWithHeaders.length > 100) {
      const chunks = [];
      for (let i = 0; i < emailsWithHeaders.length; i += 100) {
        chunks.push(emailsWithHeaders.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        const response = await resend.batch.send(chunk);
        results.push(response);
        await wait.for({ seconds: 1 });
      }
    } else {
      const response = await resend.batch.send(emailsWithHeaders);
      results.push(response);
    }

    return results;
  },
});
