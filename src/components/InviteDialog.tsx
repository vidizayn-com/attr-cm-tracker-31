import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Mail, UserPlus, CheckCircle, ExternalLink } from 'lucide-react';
import { strapiPost } from '@/lib/strapiClient';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ open, onOpenChange }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setSpecialty('');
    setSending(false);
    setSent(false);
    setPreviewUrl(null);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  const handleSend = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter the full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!specialty) {
      toast.error('Please select a specialty');
      return;
    }

    setSending(true);
    try {
      const data = await strapiPost<any>('/api/auth/doctor/invite', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        specialty,
      });

      setSent(true);
      setPreviewUrl(data.emailPreview || null);
      toast.success(`Invitation sent to ${email}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#089bab] to-[#06767f] flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            Invite New Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation email to a new doctor to join the ATTR Navigator system.
          </DialogDescription>
        </DialogHeader>

        {!sent ? (
          <div className="space-y-4 mt-2">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. John Doe"
                className="h-10 rounded-xl"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="h-10 rounded-xl pl-10"
                />
              </div>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty <span className="text-red-500">*</span>
              </label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select specialty..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="NuclearMedicine">Nuclear Medicine</SelectItem>
                  <SelectItem value="Hematology">Hematology</SelectItem>
                  <SelectItem value="Genetics">Genetics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              <p>📧 An invitation email will be sent to the doctor. They can complete their registration using the link in the email.</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1 h-10 rounded-xl"
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#089bab] to-[#06767f] hover:from-[#07858e] hover:to-[#055c64] text-white shadow-lg shadow-cyan-100"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Invitation Sent!</h3>
            <p className="text-sm text-gray-500 mb-4">
              An invitation email has been sent to <strong>{email}</strong>
            </p>

            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#089bab] hover:underline mb-4"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview Email (Dev)
              </a>
            )}

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1 rounded-xl"
              >
                Close
              </Button>
              <Button
                onClick={resetForm}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#089bab] to-[#06767f] hover:from-[#07858e] hover:to-[#055c64] text-white"
              >
                Invite Another
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
