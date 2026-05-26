import { useMemo } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Beef, 
  CheckCircle2, 
  TrendingUp,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRecipients, getAnimals, type Recipient, type Animal } from "@/api";

export default function Dashboard() {
  const { data: recipients = [] } = useQuery({ queryKey: ['recipients'], queryFn: getRecipients });
  const { data: animals = [] } = useQuery({ queryKey: ['animals'], queryFn: getAnimals });

  const totalRecipients = recipients.length;
  const takenCount = recipients.filter((r: Recipient) => r.status === "Sudah").length;
  const progressPercent = totalRecipients > 0 ? Math.round((takenCount / totalRecipients) * 100) : 0;

  const cows = animals.filter((a: Animal) => a.type === "Sapi").length;
  const goats = animals.filter((a: Animal) => a.type !== "Sapi").length;

  const groupStats = useMemo(() => {
    const groups: Record<string, { total: number, taken: number }> = {};
    
    recipients.forEach((r: Recipient) => {
      let groupName = r.note?.trim() || "Umum";
      if (groupName.toUpperCase().startsWith("ART")) {
        groupName = "ART";
      }
      
      if (!groups[groupName]) {
        groups[groupName] = { total: 0, taken: 0 };
      }
      groups[groupName].total += 1;
      if (r.status === "Sudah") {
        groups[groupName].taken += 1;
      }
    });

    return Object.entries(groups).map(([name, stats]) => {
      const progress = Math.round((stats.taken / stats.total) * 100);
      let status = "Menunggu";
      if (progress > 0 && progress < 100) status = "Berjalan";
      if (progress === 100) status = "Selesai";
      
      return {
        area: name,
        progress,
        status,
        taken: stats.taken,
        total: stats.total
      };
    }).sort((a, b) => b.total - a.total);
  }, [recipients]);

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 space-y-6 pb-28">
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">AL-ABROR Q</h1>
          <p className="text-muted-foreground text-sm font-medium">Sistem Manajemen Kurban</p>
        </div>
        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Badge variant="outline" className="text-primary border-primary">LIVE</Badge>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-2 border-primary/20 bg-card shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <Users size={16} /> Penerima
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-headline font-bold text-primary">{totalRecipients}</p>
            <p className="text-[10px] text-muted-foreground">Terdaftar di database</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/20 bg-card shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
              <CheckCircle2 size={16} /> Diambil
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-2xl font-headline font-bold text-primary">{takenCount}</p>
            <p className="text-[10px] text-primary">{progressPercent}% terdistribusi</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary text-primary-foreground border-none shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="p-6 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-lg">Progres Penyaluran</CardTitle>
            <TrendingUp size={24} />
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
              <span>Status Real-time</span>
              <span>{takenCount} / {totalRecipients}</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg"><Beef size={20} /></div>
              <div>
                <p className="text-xs font-medium opacity-80 uppercase">Stok Hewan</p>
                <p className="text-sm font-bold">{cows} Sapi, {goats} K/D</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg"><Clock size={20} /></div>
              <div>
                <p className="text-xs font-medium opacity-80 uppercase">Update</p>
                <p className="text-sm font-bold">Sinkron Cloud</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2 text-foreground">
          <Users size={20} className="text-primary" /> Pantauan Kelompok
        </h3>
        <div className="space-y-3">
          {groupStats.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-card rounded-2xl shadow-sm border-2 border-border/50">
              <div className="space-y-1">
                <p className="font-bold text-sm text-foreground capitalize">{item.area}</p>
                <div className="flex items-center gap-2">
                  <Badge variant='outline' className="text-[10px] font-bold">
                    {item.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">{item.taken}/{item.total} Diambil</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-headline font-bold text-primary">{item.progress}%</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Progres</p>
              </div>
            </div>
          ))}
          {groupStats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada data kelompok.</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
