"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronDown, X } from "lucide-react"

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterDropdownProps {
  label: string
  placeholder?: string
  options: FilterOption[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  className?: string
}

export function FilterDropdown({
  label,
  placeholder = "Select option...",
  options,
  value,
  onChange,
  multiple = false,
  searchable = true,
  clearable = true,
  disabled = false,
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : []
    }
    return value ? [value] : []
  }, [value, multiple])

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchValue) return options
    return options.filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()))
  }, [options, searchValue, searchable])

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
      setOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(multiple ? [] : "")
  }

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder

    if (multiple) {
      if (selectedValues.length === 1) {
        const option = options.find((opt) => opt.value === selectedValues[0])
        return option?.label || selectedValues[0]
      }
      return `${selectedValues.length} selected`
    }

    const option = options.find((opt) => opt.value === selectedValues[0])
    return option?.label || selectedValues[0]
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between bg-white hover:bg-gray-50",
            selectedValues.length > 0 && "text-gray-900",
            className,
          )}
          disabled={disabled}
        >
          <span className="truncate">{getDisplayText()}</span>
          <div className="flex items-center gap-1">
            {clearable && selectedValues.length > 0 && (
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" onClick={handleClear} />
            )}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          {searchable && (
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchValue}
              onValueChange={setSearchValue}
            />
          )}
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedValues.includes(option.value) ? "opacity-100" : "opacity-0")}
                  />
                  <span className="flex-1">{option.label}</span>
                  {option.count !== undefined && <span className="text-xs text-gray-500">({option.count})</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
