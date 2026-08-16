import "server-only";
import { prisma } from "@/lib/db/prisma";

export const RETURN_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "RECEIVED",
  "REFUNDED",
] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  PENDING: "Eingegangen",
  APPROVED: "Genehmigt",
  REJECTED: "Abgelehnt",
  RECEIVED: "Ware erhalten",
  REFUNDED: "Erstattet",
};

export class ReturnEligibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReturnEligibilityError";
  }
}

/** `RET-YYYY-XXXX` — sequential per year, duplicate-safe via caller retry. */
export async function nextReturnNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RET-${year}-`;
  const count = await prisma.returnRequest.count({
    where: { returnNumber: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

/**
 * Checks whether a return can be requested for an order by a customer.
 * Throws ReturnEligibilityError when not possible.
 */
export async function assertCanRequestReturn(
  orderId: number,
  customerId: number
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId },
    include: {
      returnRequests: {
        select: { status: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    throw new ReturnEligibilityError("Bestellung nicht gefunden");
  }

  if (order.status !== "DELIVERED") {
    throw new ReturnEligibilityError(
      "Eine Retoure kann erst nach Zustellung der Bestellung angefordert werden."
    );
  }

  const active = order.returnRequests.find((r) =>
    ["PENDING", "APPROVED", "RECEIVED"].includes(r.status)
  );
  if (active) {
    throw new ReturnEligibilityError(
      "Für diese Bestellung wurde bereits eine Retoure angefordert."
    );
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

export interface CreateReturnInput {
  orderId: number;
  customerId: number;
  reason: string;
  items: Array<{ productName: string; variantLabel?: string | null; qty: number }>;
}

/** Create a return request for an order (validates eligibility). */
export async function createReturnRequest(input: CreateReturnInput) {
  await assertCanRequestReturn(input.orderId, input.customerId);

  const reason = input.reason.trim() || "Kein Grund angegeben";
  const itemsJson = JSON.stringify(input.items);

  for (let attempt = 0; attempt < 3; attempt++) {
    const returnNumber = await nextReturnNumber();
    try {
      return await prisma.returnRequest.create({
        data: {
          returnNumber,
          orderId: input.orderId,
          customerId: input.customerId,
          reason,
          items: itemsJson,
          status: "PENDING",
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }
  }
  throw new Error("Retourennummer konnte nicht vergeben werden");
}
