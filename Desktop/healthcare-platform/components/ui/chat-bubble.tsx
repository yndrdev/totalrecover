"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Check, Clock, Sparkles, User } from "lucide-react";

const chatBubbleVariants = cva(
  "chat-bubble relative break-words leading-relaxed rounded-xl",
  {
    variants: {
      sender: {
        ai: "chat-bubble-ai bg-blue-50 text-gray-800 border border-blue-200 shadow-sm rounded-bl-sm",
        patient: "chat-bubble-patient bg-blue-600 text-white ml-auto rounded-br-sm shadow-sm",
        nurse: "bg-green-50 text-gray-800 border border-green-200 shadow-sm",
        system: "bg-gray-50 text-gray-700 text-center mx-auto border border-gray-200",
      },
      size: {
        default: "px-4 py-3 max-w-sm lg:max-w-md text-base",
        compact: "px-3 py-2 max-w-xs text-sm",
        large: "px-6 py-4 max-w-md lg:max-w-lg text-lg",
      },
    },
    defaultVariants: {
      sender: "ai",
      size: "default",
    },
  }
);

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chatBubbleVariants> {
  message: string;
  timestamp?: Date;
  showAvatar?: boolean;
  isTyping?: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  senderName?: string;
}

const SenderAvatar = ({ sender, senderName }: { sender: ChatBubbleProps['sender']; senderName?: string }) => {
  const avatarClass = "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0";
  
  switch (sender) {
    case 'ai':
      return (
        <div className={cn(avatarClass, "bg-gradient-to-br from-blue-600 to-blue-700")}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      );
    case 'nurse':
      return (
        <div className={cn(avatarClass, "bg-gradient-to-br from-green-500 to-green-600")}>
          <User className="w-4 h-4 text-white" />
        </div>
      );
    case 'patient':
      return (
        <div className={cn(avatarClass, "bg-gradient-to-br from-gray-400 to-gray-500")}>
          <User className="w-4 h-4 text-white" />
        </div>
      );
    default:
      return null;
  }
};

const MessageStatus = ({ status }: { status?: ChatBubbleProps['status'] }) => {
  if (!status) return null;

  const iconClass = "w-3 h-3";
  
  switch (status) {
    case 'sending':
      return <Clock className={cn(iconClass, "text-muted-foreground animate-pulse")} />;
    case 'sent':
    case 'delivered':
    case 'read':
      return <Check className={cn(iconClass, "text-muted-foreground")} />;
    default:
      return null;
  }
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1 py-2" role="status" aria-label="AI is typing">
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    <span className="sr-only">AI is typing a response</span>
  </div>
);

export function ChatBubble({
  className,
  sender,
  size,
  message,
  timestamp,
  showAvatar = true,
  isTyping = false,
  status,
  senderName,
  ...props
}: ChatBubbleProps) {
  const isPatient = sender === 'patient';
  const isAI = sender === 'ai';

  return (
    <div
      className={cn(
        "flex gap-3 w-full",
        isPatient ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar - Left side for AI/Nurse */}
      {showAvatar && !isPatient && (
        <SenderAvatar sender={sender} senderName={senderName} />
      )}

      {/* Message Content */}
      <div className={cn(
        "flex flex-col",
        isPatient ? "items-end" : "items-start",
        "max-w-[80%]"
      )}>
        {/* Sender Name (if provided and not patient) */}
        {senderName && !isPatient && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {senderName}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(chatBubbleVariants({ sender, size }), className)}
          {...props}
        >
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <div className="whitespace-pre-wrap">{message}</div>
          )}
        </div>

        {/* Timestamp and Status */}
        {(timestamp || status) && !isTyping && (
          <div className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground mt-1 px-1",
            isPatient ? "justify-end" : "justify-start"
          )}>
            {timestamp && (
              <span>
                {timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <MessageStatus status={status} />
          </div>
        )}
      </div>

      {/* Avatar - Right side for Patient */}
      {showAvatar && isPatient && (
        <SenderAvatar sender={sender} senderName={senderName} />
      )}
    </div>
  );
}

export { chatBubbleVariants };