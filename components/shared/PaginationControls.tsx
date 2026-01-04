import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
    className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize,
    className
}) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

    return (
        <div className={cn("flex items-center justify-between pt-4 border-t border-border/50 mt-2", className)}>
            <span className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
                <span className="font-medium text-foreground">{endItem}</span>{' '}
                of <span className="font-medium text-foreground">{totalItems}</span> results
            </span>

            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="h-8 px-3 gap-1 text-xs font-medium shadow-sm"
                >
                    <ChevronLeft className="h-3 w-3" />
                    Prev
                </Button>
                
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 gap-1 text-xs font-medium shadow-sm"
                >
                    Next
                    <ChevronRight className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
};
