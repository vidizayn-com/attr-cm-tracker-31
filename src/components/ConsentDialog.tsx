import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Shield, ShieldCheck, ShieldX } from 'lucide-react';

const ConsentDialog = () => {
    const { currentUser, updateConsent } = useUser();

    // Only show if user is logged in and consent has NOT been asked yet
    const shouldShow = currentUser && !currentUser.consentAsked;

    const handleAccept = async () => {
        const success = await updateConsent(true);
        if (success) {
            toast.success("Thank you! Your consent has been recorded.");
        }
    };

    const handleDecline = async () => {
        const success = await updateConsent(false);
        if (success) {
            toast.info("Your preference has been saved. You can change this from your profile settings.");
        }
    };

    return (
        <Dialog open={!!shouldShow}>
            <DialogContent
                className="sm:max-w-lg"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="text-center">
                    <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Data Sharing Consent
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-1">
                        Association Data Sharing Agreement
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    {/* Consent Text */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-60 overflow-y-auto">
                        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Consent to Share Information with the Association</h3>
                        <div className="text-sm text-gray-700 space-y-2">
                            <p>
                                Dear <strong>{currentUser?.name}</strong>,
                            </p>
                            <p>
                                We request your permission to transparently share statistical information
                                about the patient data you record on the ATTR-CM Tracker platform with the
                                Dika Cardio Association.
                            </p>
                            <p>
                                This sharing includes:
                            </p>
                            <ul className="list-disc ml-4 space-y-1">
                                <li>Total patient count and distribution</li>
                                <li>Patient diagnosis status and clinical data</li>
                                <li>Anonymized data for statistical analysis</li>
                            </ul>
                            <p>
                                This information will be viewable by the association administration.
                            </p>
                            <p className="text-xs text-gray-500 mt-3 italic">
                                You can change this consent at any time from your profile settings.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            onClick={handleDecline}
                        >
                            <ShieldX className="w-4 h-4 mr-2" />
                            Decline
                        </Button>
                        <Button
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-md"
                            onClick={handleAccept}
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" />
                            I Consent
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConsentDialog;
