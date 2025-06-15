
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { Sentiment } from "@/services/feedbackService";
import { cn } from "@/lib/utils";

interface SentimentBadgeProps {
  sentiment: Sentiment;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export const SentimentBadge = ({
  sentiment,
  showIcon = true,
  size = "default",
  className,
}: SentimentBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs py-0 h-5",
    default: "text-xs py-1",
    lg: "text-sm py-1.5",
  };
  
  const badgeStyles = {
    positive: "bg-green-100 text-green-800 hover:bg-green-100",
    neutral: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    negative: "bg-red-100 text-red-800 hover:bg-red-100",
  };
  
  const icons = {
    positive: <ThumbsUp size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
    neutral: <Minus size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
    negative: <ThumbsDown size={size === "sm" ? 12 : size === "lg" ? 16 : 14} />,
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium flex items-center gap-1", 
        badgeStyles[sentiment], 
        sizeClasses[size],
        className
      )}
    >
      {showIcon && icons[sentiment]}
      <span>
        {sentiment === "positive" ? "Positive" : sentiment === "negative" ? "Negative" : "Neutral"}
      </span>
    </Badge>
  );
};
