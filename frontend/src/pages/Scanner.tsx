import { useState, useEffect, useRef } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, XCircle, RefreshCw, Keyboard, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Html5Qrcode } from "html5-qrcode";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecipients, saveRecipient, type Recipient } from "@/api";

export default function Scanner() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isScanning, setIsScanning] = useState(true);
  const [manualId, setManualId] = useState("");
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const { data: recipients = [], isLoading: docLoading } = useQuery({ queryKey: ['recipients'], queryFn: getRecipients });

  const recipientMutation = useMutation({
    mutationFn: saveRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      toast({ title: "PENGAMBILAN BERHASIL", description: `Kupon diverifikasi.` });
      resetScanner();
    }
  });

  const recipient = recipients.find((r: Recipient) => r.id === scanningId);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    if (isScanning && !scanningId) {
      const startScanner = async () => {
        try {
          const readerElement = document.getElementById("reader");
          if (!readerElement) return;

          html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
          
          await html5QrCode.start(
            { facingMode: facingMode }, 
            config, 
            (decodedText) => {
              if (isMounted) {
                setScanningId(decodedText);
                setIsScanning(false);
                html5QrCode?.stop().catch(console.error);
              }
            },
            () => {}
          );
        } catch (err) {
          console.error("Camera fail:", err);
        }
      };
      startScanner();
    }
    
    return () => {
      isMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isScanning, scanningId, facingMode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.length < 3) {
      toast({ variant: "destructive", title: "Format Salah", description: "Nomor kupon tidak valid." });
      return;
    }
    setScanningId(manualId);
    setIsScanning(false);
  };

  const handleConfirmCollection = () => {
    if (!recipient) return;
    
    recipientMutation.mutate({ ...recipient, status: "Sudah" });
  };

  const resetScanner = () => {
    setScanningId(null);
    setManualId("");
    setIsScanning(true);
  };

  const status = scanningId ? (recipient ? (recipient.status === "Sudah" ? "duplicate" : "success") : (docLoading ? "loading" : "error")) : null;

  return (
    <div className={cn("flex flex-col min-h-screen", status === 'success' ? "bg-primary/5" : status === 'duplicate' ? "bg-destructive/5" : "bg-background")}>
      <div className="p-4 space-y-6 pb-28">
        <header className="pt-2 text-center">
          <h1 className="text-2xl font-headline font-bold text-primary uppercase">Validator Kupon</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Al-Abror Q Hub</p>
        </header>

        {isScanning ? (
          <div className="space-y-6">
            <div className="relative aspect-square w-full max-w-sm mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-primary">
              <div id="reader" className="w-full h-full"></div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setFacingMode(prev => prev === "environment" ? "user" : "environment")}
                className="absolute top-4 right-4 rounded-full h-10 w-10 bg-white/20 backdrop-blur border-none hover:bg-white/40 text-white z-10"
              >
                <RefreshCw size={20} />
              </Button>
            </div>
            <Card className="p-5 border-2 border-dashed border-primary/30">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Keyboard size={14} /> Masukan Nomor Kupon
                </Label>
                <div className="flex gap-2">
                  <Input 
                    inputMode="numeric" 
                    placeholder="Contoh: 0101001" 
                    value={manualId} 
                    onChange={(e) => setManualId(e.target.value)} 
                    className="h-12 font-bold font-mono tracking-widest" 
                  />
                  <Button type="submit" className="h-12 px-6 font-bold uppercase text-xs">Cek</Button>
                </div>
              </form>
            </Card>
          </div>
        ) : (
          <Card className={cn("p-8 text-center space-y-6 border-4 shadow-xl", status === 'success' ? "border-primary" : status === 'duplicate' ? "border-destructive" : "border-muted")}>
            {status === 'loading' ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="font-bold">Mencari data...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  {status === 'success' ? (
                    <div className="p-4 bg-primary/10 rounded-full"><ShieldCheck size={64} className="text-primary" /></div>
                  ) : (
                    <div className="p-4 bg-destructive/10 rounded-full"><XCircle size={64} className="text-destructive" /></div>
                  )}
                </div>
                <div className="space-y-1">
                  <h2 className={cn("text-3xl font-headline font-bold uppercase", status === 'success' ? "text-primary" : status === 'duplicate' ? "SUDAH DIAMBIL" : "DATA TIDAK DITEMUKAN")}>
                    {status === 'success' ? "KUPON VALID" : status === 'duplicate' ? "SUDAH DIAMBIL" : "DATA TIDAK DITEMUKAN"}
                  </h2>
                  <p className="text-lg font-mono font-bold text-muted-foreground">ID: {scanningId}</p>
                </div>
                {recipient && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Nama Penerima</p>
                    <p className="text-xl font-bold">{recipient.name}</p>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {status === 'success' && (
                    <Button onClick={handleConfirmCollection} size="lg" className="w-full h-14 font-bold bg-primary shadow-lg uppercase">
                      <CheckCircle2 className="mr-2" /> Konfirmasi Penyerahan
                    </Button>
                  )}
                  <Button onClick={resetScanner} variant="outline" size="lg" className="w-full h-14 font-bold border-2 uppercase">
                    <RefreshCw className="mr-2" /> Kembali Scan
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
