import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportReminderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notifications: any[];
}

const ReportReminderDialog: React.FC<ReportReminderDialogProps> = ({ open, onOpenChange, notifications }) => {
    const navigate = useNavigate();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center shadow-lg">
                            <ShieldAlert className="w-8 h-8 text-amber-500" />
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Pending Report Deadlines
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                        You have patients requiring urgent report renewals
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                        <h3 className="font-semibold text-amber-800 mb-2 text-sm flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {notifications.length} Patient(s) due for renewal
                        </h3>
                        <div className="text-sm text-gray-700 space-y-2 max-h-40 overflow-y-auto pr-2">
                            {notifications.map(n => (
                                <div key={n.patientId} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100">
                                    <span className="font-medium truncate mr-2">{n.fullName}</span>
                                    <span className={`text-xs whitespace-nowrap ${n.isOverdue ? 'text-red-500 font-bold' : 'text-amber-600'}`}>
                                        {n.isOverdue ? 'Overdue!' : `${n.daysLeft} days left`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <DialogFooter className="mt-4 sm:justify-center flex-col gap-2">
                    <Button
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl"
                        onClick={() => {
                            onOpenChange(false);
                            navigate('/report-tracker');
                        }}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Go to Report Tracker
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-gray-500 hover:text-gray-700 rounded-xl"
                        onClick={() => onOpenChange(false)}
                    >
                        Dismiss
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportReminderDialog;
