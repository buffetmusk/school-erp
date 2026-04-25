import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ParentRegistration() {
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [studentNo, setStudentNo] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");

  const sendOTPMutation = trpc.parentAuth.sendOTP.useMutation({
    onSuccess: (data) => {
      setStudentName(data.studentName);
      setStep("otp");
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const verifyOTPMutation = trpc.parentAuth.verifyOTPAndRegister.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentNo || !phone) {
      toast.error("Please fill in all fields");
      return;
    }
    sendOTPMutation.mutate({ studentNo, phone });
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }
    setStep("details");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    verifyOTPMutation.mutate({
      studentNo,
      phone,
      otp,
      name,
      email: email || undefined,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Parent Registration</CardTitle>
          <CardDescription className="text-center">
            Register using your child's student roll number and registered mobile number
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentNo">Student Roll Number</Label>
                <Input
                  id="studentNo"
                  placeholder="Enter student roll number"
                  value={studentNo}
                  onChange={(e) => setStudentNo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Registered Mobile Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter registered mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={sendOTPMutation.isPending}
              >
                {sendOTPMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  OTP sent to {phone}
                </p>
                <p className="text-sm font-medium">Student: {studentName}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("phone")}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Verify OTP
                </Button>
              </div>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => sendOTPMutation.mutate({ studentNo, phone })}
                disabled={sendOTPMutation.isPending}
              >
                Resend OTP
              </Button>
            </form>
          )}

          {step === "details" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">OTP Verified!</p>
                <p className="text-sm text-muted-foreground">
                  Complete your registration
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={verifyOTPMutation.isPending}
              >
                {verifyOTPMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
