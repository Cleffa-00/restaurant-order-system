"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { formatDateForDisplay, getTodayEasternDateString, getYesterdayEasternDateString } from "@/lib/utils/date-utils"

interface OrderDateFilterProps {
  selectedDate: string
  onDateChange: (date: string) => void
}

export function OrderDateFilter({ selectedDate, onDateChange }: OrderDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempDate, setTempDate] = useState(selectedDate)
  const [lastValidDate, setLastValidDate] = useState(selectedDate)
  const inputRef = useRef<HTMLInputElement>(null)
  const isUserClickingDate = useRef(false)

  const handleDateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value
    setTempDate(newDate)
  }

  const handleDateClick = (event: React.MouseEvent<HTMLInputElement>) => {
    isUserClickingDate.current = true

    setTimeout(() => {
      const currentValue = inputRef.current?.value
      if (currentValue && currentValue !== lastValidDate && currentValue.length === 10) {
        onDateChange(currentValue)
        setLastValidDate(currentValue)
        setIsOpen(false)
      }
      isUserClickingDate.current = false
    }, 100)
  }

  const handleQuickSelect = (dateString: string) => {
    setTempDate(dateString)
    setLastValidDate(dateString)
    onDateChange(dateString)
    setIsOpen(false)
  }

  const handleOpen = () => {
    setTempDate(selectedDate)
    setLastValidDate(selectedDate)
    setIsOpen(true)
  }

  const handleClose = () => {
    setTempDate(selectedDate)
    setIsOpen(false)
  }

  const handleApply = () => {
    if (tempDate && tempDate.length === 10) {
      onDateChange(tempDate)
      setLastValidDate(tempDate)
      setIsOpen(false)
    }
  }

  const handleBackdropClick = () => {
    handleClose()
  }

  useEffect(() => {
    setTempDate(selectedDate)
    setLastValidDate(selectedDate)
  }, [selectedDate])

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 rounded-md px-3 py-2 text-sm"
      >
        <Calendar className="h-4 w-4" />
        <span className="font-normal">{formatDateForDisplay(selectedDate)}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-6 z-10 min-w-[320px]">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Select Date</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                <span>Eastern Time</span>
              </div>
            </div>
          </div>

          {/* Custom styled date input */}
          <div className="mb-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="date"
                value={tempDate}
                onChange={handleDateInput}
                onClick={handleDateClick}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm bg-white text-gray-900"
                style={{
                  colorScheme: "light",
                }}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect(getTodayEasternDateString())}
                className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Today
                </div>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect(getYesterdayEasternDateString())}
                className="bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Yesterday
                </div>
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 text-sm"
            >
              Cancel
            </Button>
            {tempDate !== selectedDate && tempDate.length === 10 && (
              <Button size="sm" onClick={handleApply} className="bg-black hover:bg-gray-800 text-white text-sm">
                Apply Date
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && <div className="fixed inset-0 z-0 bg-black/10 backdrop-blur-sm" onClick={handleBackdropClick} />}
    </div>
  )
}
