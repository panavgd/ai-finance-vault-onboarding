import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  "data-ocid"?: string;
}

export function Card({
  children,
  className = "",
  "data-ocid": dataOcid,
}: CardProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={`bg-card border border-border rounded-2xl shadow-elevated ${className}`}
    >
      {children}
    </div>
  );
}
