import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { createSocketClient, disconnectSocketClient } from "../services/socketClient";

const RealtimeContext = createContext({
  notifications: [],
  activities: [],
  clearNotifications: () => {},
  removeNotification: () => {},
});

const MAX_ITEMS = 20;

const buildNotification = (type, title, message, payload) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  title,
  message,
  payload,
  createdAt: new Date().toISOString(),
  read: false,
});

export const RealtimeProvider = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!token) {
      disconnectSocketClient();
      return;
    }

    const socket = createSocketClient(token);

    const pushEvent = (notification, toastType = "success") => {
      setNotifications((prev) => [notification, ...prev].slice(0, MAX_ITEMS));
      setActivities((prev) => [notification, ...prev].slice(0, MAX_ITEMS));

      if (toastType === "error") {
        toast.error(notification.title);
      } else if (toastType === "warning") {
        toast(notification.title, { icon: "!" });
      } else {
        toast.success(notification.title);
      }
    };

    socket.emit("subscribe-dashboard");

    const onNewEmergency = (payload) => {
      const note = buildNotification(
        "new-emergency",
        "New emergency request",
        `${payload.patientName || "Patient"} - ${payload.hospital || "Hospital"}`,
        payload
      );
      pushEvent(note, "error");
    };

    const onInventoryUpdated = (payload) => {
      const note = buildNotification(
        "inventory-updated",
        "Inventory updated",
        `${payload.module || "inventory"} ${payload.action || "changed"}`,
        payload
      );
      pushEvent(note, "success");
    };

    const onRequestApproved = (payload) => {
      const note = buildNotification(
        "request-approved",
        "Request approved",
        `${payload.patientName || "Request"} approved`,
        payload
      );
      pushEvent(note, "success");
    };

    const onDonorAssigned = (payload) => {
      const note = buildNotification(
        "donor-assigned",
        "Donor assigned",
        `${payload.assignedDonor || "Donor"} assigned`,
        payload
      );
      pushEvent(note, "warning");
    };

    const onRequestForwarded = (payload) => {
      const note = buildNotification(
        "request-forwarded-to-app",
        "Request forwarded to app",
        `${payload.patientName || "Request"} forwarded for mobile app fulfillment`,
        payload
      );
      pushEvent(note, "warning");
    };

    socket.on("new-emergency", onNewEmergency);
    socket.on("inventory-updated", onInventoryUpdated);
    socket.on("request-approved", onRequestApproved);
    socket.on("donor-assigned", onDonorAssigned);
    socket.on("request-forwarded-to-app", onRequestForwarded);

    return () => {
      socket.off("new-emergency", onNewEmergency);
      socket.off("inventory-updated", onInventoryUpdated);
      socket.off("request-approved", onRequestApproved);
      socket.off("donor-assigned", onDonorAssigned);
      socket.off("request-forwarded-to-app", onRequestForwarded);
    };
  }, [token]);

  const value = useMemo(
    () => ({
      notifications,
      activities,
      clearNotifications: () => setNotifications([]),
      removeNotification: (id) => setNotifications((prev) => prev.filter((item) => item.id !== id)),
    }),
    [notifications, activities]
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => useContext(RealtimeContext);
