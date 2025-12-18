import { Preparation } from "@/types/preparation";

export interface PreparationStatus {
  label: string;
  color: string;
  bgColor: string;
}

export function getPreparationStatus(preparation: Preparation): PreparationStatus {
  if (preparation.cancelled_at) {
    return { label: "Cancelled", color: "text-gray-600", bgColor: "bg-gray-100" };
  }
  if (preparation.rejected_at) {
    return { label: "Rejected", color: "text-red-700", bgColor: "bg-red-100" };
  }
  if (preparation.accepted_at && preparation.ready_at) {
    const readyTime = new Date(preparation.ready_at);
    const now = new Date();
    if (readyTime <= now) {
      return { label: "Ready", color: "text-green-700", bgColor: "bg-green-100" };
    }
    return { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-100" };
  }
  if (preparation.accepted_at) {
    return { label: "In Progress", color: "text-blue-700", bgColor: "bg-blue-100" };
  }
  return { label: "Pending", color: "text-orange-700", bgColor: "bg-orange-100" };
}
