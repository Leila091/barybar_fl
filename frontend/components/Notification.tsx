import React from "react";

interface NotificationProps {
    message: string;
    type: "error" | "success";
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-lg font-bold">×</button>
            </div>
        </div>
    );
};

export default Notification;