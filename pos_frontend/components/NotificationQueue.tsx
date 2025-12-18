"use client";

import { useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNotifications, Notification } from "@/context/NotificationContext";
import { acceptPreparation } from "@/actions/acceptPreparation";
import { rejectPreparation } from "@/actions/rejectPreparation";
import { formatTime } from "@/utils/formatTime";

const TIME_OPTIONS = [
  { label: "10m", minutes: 10 },
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
];

function NotificationItem({
  notification,
  onAction,
}: {
  notification: Notification;
  onAction: () => void;
}) {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [isPending, startTransition] = useTransition();
  const { removeNotification, markAsRead } = useNotifications();

  const preparation = notification.preparation;
  const itemsSummary = preparation.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  const handleAccept = () => {
    const now = new Date();
    const readyAt = new Date(now.getTime() + selectedMinutes * 60 * 1000);

    startTransition(async () => {
      try {
        await acceptPreparation(preparation.id, readyAt.toISOString());
        removeNotification(notification.id);
        onAction();
      } catch (err) {
        console.error("Failed to accept:", err);
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      try {
        await rejectPreparation(preparation.id);
        removeNotification(notification.id);
        onAction();
      } catch (err) {
        console.error("Failed to reject:", err);
      }
    });
  };

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-100 ${
        !notification.read ? "bg-blue-50/50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {!notification.read && (
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
          <span className="font-semibold text-gray-900">
            {preparation.order_id}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {formatTime(notification.timestamp.toISOString())}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-1">{itemsSummary}</p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">Ready in:</span>
        <div className="flex gap-1">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.minutes}
              onClick={() => setSelectedMinutes(option.minutes)}
              disabled={isPending}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                selectedMinutes === option.minutes
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleReject}
          disabled={isPending}
          className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          disabled={isPending}
          className="flex-1 py-2 px-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
        >
          {isPending ? "..." : "Accept"}
        </button>
      </div>
    </div>
  );
}

export default function NotificationQueue() {
  const { notifications, unreadCount, markAllAsRead, clearAll } =
    useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button className="relative p-3 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <svg
                className="w-12 h-12 mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onAction={() => {}}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
