import { NextResponse } from "next/server";

import { isAuthorizedCrmIntegrationRequest } from "@/lib/crm-integration-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;

function parseCursorTimestamp(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid updated_after cursor");
  }

  return date.toISOString();
}

function parseCursorId(value: string | null) {
  if (!value) {
    return null;
  }

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(value)) {
    throw new Error("Invalid updated_after_id cursor");
  }

  return value;
}

function parseLimit(value: string | null) {
  if (!value) {
    return DEFAULT_LIMIT;
  }

  const limit = Number(value);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    throw new Error(
      `limit must be an integer between 1 and ${MAX_LIMIT}`
    );
  }

  return limit;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorizedCrmIntegrationRequest(request)) {
      return NextResponse.json(
        {
          error: "unauthorized",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const url = new URL(request.url);

    const updatedAfter = parseCursorTimestamp(
      url.searchParams.get("updated_after")
    );

    const updatedAfterId = parseCursorId(
      url.searchParams.get("updated_after_id")
    );

    if (
      (updatedAfter === null) !==
      (updatedAfterId === null)
    ) {
      return NextResponse.json(
        {
          error:
            "updated_after and updated_after_id must be supplied together",
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const limit = parseLimit(
      url.searchParams.get("limit")
    );

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc(
      "list_crm_identity_profiles",
      {
        p_updated_after: updatedAfter,
        p_updated_after_id: updatedAfterId,
        p_limit: limit,
      }
    );

    if (error) {
      console.error(
        "Favn360 CRM identity RPC failed",
        {
          code: error.code,
          message: error.message,
        }
      );

      return NextResponse.json(
        {
          error: "identity_query_failed",
        },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const identities = Array.isArray(data)
      ? data
      : [];

    const lastIdentity =
      identities.length > 0
        ? identities[identities.length - 1]
        : null;

    const nextCursor =
      identities.length === limit &&
      lastIdentity &&
      typeof lastIdentity.updated_at === "string" &&
      typeof lastIdentity.user_id === "string"
        ? {
            updated_after: lastIdentity.updated_at,
            updated_after_id: lastIdentity.user_id,
          }
        : null;

    return NextResponse.json(
      {
        contract_version: 1,
        identities,
        next_cursor: nextCursor,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message.startsWith("Invalid ") ||
        error.message.startsWith("limit must")
      )
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    console.error(
      "Favn360 CRM identity endpoint failed",
      error
    );

    return NextResponse.json(
      {
        error: "internal_server_error",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
