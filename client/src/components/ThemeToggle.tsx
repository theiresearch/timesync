import { useTheme } from "@/context/ThemeProvider";
import { Button } from "@/components/ui/button";
import React from "react";

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        className={`${theme === "light" ? "bg-accent" : ""} h-9 w-9 rounded-md`}
        aria-label="Light theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </Button>
      
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setTheme("dark")}
        className={`${theme === "dark" ? "bg-accent" : ""} h-9 w-9 rounded-md`}
        aria-label="Dark theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </Button>
      
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setTheme("system")}
        className={`${theme === "system" ? "bg-accent" : ""} h-9 w-9 rounded-md`}
        aria-label="System theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <rect width="16" height="12" x="4" y="3" rx="2" />
          <path d="M5 15h14" />
          <path d="M12 17v4" />
          <path d="M8 21h8" />
        </svg>
      </Button>
    </div>
  );
}