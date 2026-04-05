'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X } from 'lucide-react'
import type { CaseFilters } from '@/lib/types'
import { caseTypeLabels, caseStatusLabels, casePriorityLabels } from '@/lib/types'

interface CasesFiltersProps {
  filters: CaseFilters
}

export function CasesFilters({ filters }: CasesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(filters.search || '')

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to page 1 on filter change

    startTransition(() => {
      router.push(`/cases/all?${params.toString()}`)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  const clearFilters = () => {
    setSearch('')
    startTransition(() => {
      router.push('/cases/all')
    })
  }

  const hasActiveFilters =
    filters.search ||
    (filters.type && filters.type !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.priority && filters.priority !== 'all')

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, case number, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Type Filter */}
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => updateFilter('type', value)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(caseTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(caseStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) => updateFilter('priority', value)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              {Object.entries(casePriorityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} disabled={isPending}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
