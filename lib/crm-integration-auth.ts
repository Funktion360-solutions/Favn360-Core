import "server-only";

import { timingSafeEqual } from "node:crypto";

function secretsMatch(
  provided: string,
  expected: string
): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(
    providedBuffer,
    expectedBuffer
  );
}

export function isAuthorizedCrmIntegrationRequest(
  request: Request
): boolean {
  const expectedSecret =
    process.env.CRM_INTEGRATION_SECRET;

  if (!expectedSecret) {
    throw new Error(
      "CRM_INTEGRATION_SECRET is not configured"
    );
  }

  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const providedSecret =
    authorization.slice("Bearer ".length);

  if (!providedSecret) {
    return false;
  }

  return secretsMatch(
    providedSecret,
    expectedSecret
  );
}
