// Direct re-export to address TypeScript compatibility issues
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"

// Select components
export type { SelectProps } from "@radix-ui/react-select"
export const Select = SelectPrimitive.Root;

export type { SelectGroupProps } from "@radix-ui/react-select"
export const SelectGroup = SelectPrimitive.Group;

export type { SelectValueProps } from "@radix-ui/react-select"
export const SelectValue = SelectPrimitive.Value;

export type { SelectTriggerProps } from "@radix-ui/react-select"
export const SelectTrigger = SelectPrimitive.Trigger;

export type { SelectContentProps } from "@radix-ui/react-select"
export const SelectContent = SelectPrimitive.Content;

export type { SelectLabelProps } from "@radix-ui/react-select"
export const SelectLabel = SelectPrimitive.Label;

export type { SelectItemProps } from "@radix-ui/react-select"
export const SelectItem = SelectPrimitive.Item;

export type { SelectSeparatorProps } from "@radix-ui/react-select"
export const SelectSeparator = SelectPrimitive.Separator;

// Additional exports for completeness
export const SelectPortal = SelectPrimitive.Portal;
export const SelectViewport = SelectPrimitive.Viewport;
export const SelectIcon = SelectPrimitive.Icon;
export const SelectItemText = SelectPrimitive.ItemText;
export const SelectItemIndicator = SelectPrimitive.ItemIndicator;
export const SelectScrollUpButton = SelectPrimitive.ScrollUpButton;
export const SelectScrollDownButton = SelectPrimitive.ScrollDownButton;