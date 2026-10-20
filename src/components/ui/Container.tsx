import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Standard site-wide container utility.
 * Enforces width 100%, max-width 1600px, and responsive horizontal paddings:
 * - Mobile: px-4 (16px)
 * - Tablet: px-6 (24px)
 * - Desktop: px-10 (40px)
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  className = "",
  as: Component = "div",
  ...props
}) => {
  return (
    <Component className={`site-container ${className}`} {...props}>
      {children}
    </Component>
  );
};
