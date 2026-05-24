import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useRealtime } from "../../context/RealtimeContext";
import { emergencyService } from "../../services/emergencyService";
import { ROLES } from "../../utils/roles";

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const { notifications, clearNotifications, removeNotification } = useRealtime();
  const user = useSelector((state) => state.auth.user);
  const canTakeRequestActions = user?.role === ROLES.SUPER_ADMIN;

  const handleApprove = async (notification) => {
    try {
      setApproving(true);
      const requestId = notification.payload._id;
      await emergencyService.approve(requestId);
      removeNotification(notification.id);
      toast.success("Request approved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to approve request");
    } finally {
      setApproving(false);
    }
  };

  const handleForwardToApp = async (notification) => {
    try {
      setApproving(true);
      const requestId = notification.payload._id;
      await emergencyService.forwardToApp(requestId, "Forwarded due to unavailable stock");
      removeNotification(notification.id);
      toast.success("Request forwarded to app queue");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to forward request");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Notifications
        {notifications.length > 0 && (
          <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-xs text-white">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Live Notifications</p>
            <button type="button" onClick={clearNotifications} className="text-xs text-rose-600 hover:underline">Clear</button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">No notifications yet</p>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-2.5">
                  <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.message}</p>
                  
                  {/* Action buttons for emergency requests */}
                  {canTakeRequestActions && item.type === "new-emergency" && item.payload && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleApprove(item)}
                        disabled={approving}
                        className="flex-1 rounded-lg bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleForwardToApp(item)}
                        disabled={approving}
                        className="flex-1 rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-70"
                      >
                        Forward to App
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
