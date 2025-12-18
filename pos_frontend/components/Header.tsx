"use client";

import NotificationQueue from "./NotificationQueue";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">Kitchen Display</h1>
        <NotificationQueue />
      </div>
    </header>
  );
}
