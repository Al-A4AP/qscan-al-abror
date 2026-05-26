import { useState, useMemo, useRef } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Beef, CheckCircle2, Clock, Users, Plus, Pencil, Eye, Download, Upload, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecipients, getAnimals, saveRecipient, saveAnimal, type Recipient, type Animal } from "@/api";
import { useReactToPrint } from "react-to-print";
import { CouponPrintTemplate } from "@/components/CouponPrintTemplate";

type DetailItemType = 
  | { type: 'recipient', data: Recipient }
  | { type: 'animal', data: Animal };

export default function Registry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState("recipients");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  
  const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
  const [isAnimalDialogOpen, setIsAnimalDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Kupon_Kurban",
  });

  const { data: recipients = [], isLoading: recipientsLoading } = useQuery({ queryKey: ['recipients'], queryFn: getRecipients });
  const { data: animals = [], isLoading: animalsLoading } = useQuery({ queryKey: ['animals'], queryFn: getAnimals });

  const isDataLoading = recipientsLoading || animalsLoading;

  const recipientMutation = useMutation({
    mutationFn: saveRecipient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
      toast({ title: "Berhasil", description: isEditing ? "Data diperbarui." : "Penerima ditambahkan." });
      setIsRecipientDialogOpen(false);
    }
  });

  const animalMutation = useMutation({
    mutationFn: saveAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      toast({ title: "Berhasil", description: isEditing ? "Data diperbarui." : "Hewan didaftarkan." });
      setIsAnimalDialogOpen(false);
    }
  });

  const [newRecipient, setNewRecipient] = useState({ id: "", name: "", address: "", note: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newAnimal, setNewAnimal] = useState({ id: "", donor: "", address: "", note: "", type: "Sapi", weight: "" });
  const [editingTag, setEditingTag] = useState<string | null>(null);

  const [detailItem, setDetailItem] = useState<DetailItemType | null>(null);

  const stats = useMemo(() => {
    const total = recipients.length;
    const sudah = recipients.filter((r: Recipient) => r.status === "Sudah").length;
    const belum = total - sudah;
    return { total, sudah, belum };
  }, [recipients]);

  const filteredRecipients = useMemo(() => {
    return recipients.filter((r: Recipient) => {
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.includes(searchTerm);
      
      let matchesFilter = false;
      if (filterStatus === "Semua") matchesFilter = true;
      else if (filterStatus === "Sudah") matchesFilter = r.status === "Sudah";
      else if (filterStatus === "Belum") matchesFilter = r.status !== "Sudah";

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus, recipients]);

  const filteredAnimals = useMemo(() => {
    return animals.filter((a: Animal) => {
      const matchesSearch = a.donor.toLowerCase().includes(searchTerm.toLowerCase()) || a.id.toLowerCase().includes(searchTerm.toLowerCase());
      const statusLabel = a.status === 'Selesai' ? 'Sudah' : 'Belum';
      const matchesFilter = filterStatus === "Semua" || statusLabel === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus, animals]);

  const handleOpenRecipientDialog = (person?: Recipient) => {
    if (person) {
      setIsEditing(true);
      setEditingId(person.id);
      setNewRecipient({ id: person.id, name: person.name, address: person.address || "", note: person.note || "" });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setNewRecipient({ id: "", name: "", address: "", note: "" });
    }
    setIsRecipientDialogOpen(true);
  };

  const handleSaveRecipient = () => {
    if (!newRecipient.id || !newRecipient.name) return;
    
    const data: Recipient = {
      ...newRecipient,
      status: isEditing ? (recipients.find((r: Recipient) => r.id === editingId)?.status || "Belum") : "Belum",
    };

    recipientMutation.mutate(data);
  };

  const handleOpenAnimalDialog = (animal?: Animal) => {
    if (animal) {
      setIsEditing(true);
      setEditingTag(animal.id);
      setNewAnimal({ id: animal.id, donor: animal.donor, address: animal.address || "", note: animal.note || "", type: animal.type, weight: animal.weight.toString() });
    } else {
      setIsEditing(false);
      setEditingTag(null);
      setNewAnimal({ id: "", donor: "", address: "", note: "", type: "Sapi", weight: "" });
    }
    setIsAnimalDialogOpen(true);
  };

  const handleSaveAnimal = () => {
    if (!newAnimal.id || !newAnimal.donor) return;
    
    const data: Animal = {
      id: newAnimal.id,
      donor: newAnimal.donor,
      weight: Number(newAnimal.weight) || 0,
      type: newAnimal.type,
      address: newAnimal.address,
      note: newAnimal.note,
      status: isEditing ? (animals.find((a: Animal) => a.id === editingTag)?.status || "Antri") : "Antri",
    };

    animalMutation.mutate(data);
  };

  const handleShowDetailRecipient = (item: Recipient) => {
    setDetailItem({ type: 'recipient', data: item });
    setIsDetailDialogOpen(true);
  };

  const handleShowDetailAnimal = (item: Animal) => {
    setDetailItem({ type: 'animal', data: item });
    setIsDetailDialogOpen(true);
  };

  const handleDownload = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeTab === "recipients") {
      csvContent += "Nomor Kupon,Nama Penerima,Alamat,Status,Catatan,QR Code URL\n";
      recipients.forEach((r: Recipient) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${r.id}`;
        csvContent += `"${r.id}","${r.name}","${r.address || '-'}","${r.status}","${r.note || '-'}","${qrUrl}"\n`;
      });
    } else {
      csvContent += "Tag Hewan,Pekurban,Jenis,Berat (kg),Status,Lokasi,Catatan\n";
      animals.forEach((a: Animal) => {
        csvContent += `"${a.id}","${a.donor}","${a.type}","${a.weight}","${a.status}","${a.address || '-'}","${a.note || '-'}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", activeTab === "recipients" ? "data_penerima.csv" : "data_hewan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").slice(1);
      
      rows.forEach(row => {
        const parts = row.split(",").map(s => s?.replace(/"/g, '').trim());
        if (activeTab === "recipients") {
          const [id, name, address, status, note] = parts;
          if (id && name) {
            recipientMutation.mutate({
              id, name, address: address || "-", status: status || "Belum", note: note || "-"
            });
          }
        } else {
          const [id, donor, type, weight, status, address, note] = parts;
          if (id && donor) {
            animalMutation.mutate({
              id, donor, type: type || "Sapi", weight: Number(weight) || 0, status: status || "Antri", address: address || "-", note: note || "-"
            });
          }
        }
      });
      toast({ title: "Impor Selesai", description: "Data sedang diproses." });
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 pb-28 space-y-4">
      <header className="pt-2 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary uppercase tracking-tight">Registri</h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
            {isDataLoading ? (
              <span className="text-amber-500 animate-pulse">⟳ Memuat data...</span>
            ) : (
              "Data Terpusat"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleUpload} />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="rounded-2xl border-2 h-12 w-12 text-primary">
            <Upload size={20} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload} className="rounded-2xl border-2 h-12 w-12 text-primary">
            <Download size={20} />
          </Button>
          {activeTab === 'recipients' && (
            <Button variant="outline" size="icon" onClick={() => handlePrint()} className="rounded-2xl border-2 h-12 w-12 text-primary">
              <Printer size={20} />
            </Button>
          )}
          <Button onClick={() => activeTab === 'recipients' ? handleOpenRecipientDialog() : handleOpenAnimalDialog()} size="icon" className="rounded-2xl bg-primary h-12 w-12 shadow-lg">
            <Plus size={24} />
          </Button>
        </div>
      </header>

      {/* Tabs and tables rendering omitted for brevity but they are structurally same */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", val: activeTab === 'recipients' ? stats.total : animals.length, color: "text-primary", icon: Users, status: "Semua" },
          { label: "Sudah", val: activeTab === 'recipients' ? stats.sudah : animals.filter((a: Animal) => a.status === 'Selesai').length, color: "text-green-600", icon: CheckCircle2, status: "Sudah" },
          { label: "Belum", val: activeTab === 'recipients' ? stats.belum : animals.filter((a: Animal) => a.status !== 'Selesai').length, color: "text-amber-600", icon: Clock, status: "Belum" },
        ].map((s) => (
          <Card key={s.status} onClick={() => setFilterStatus(s.status)} className={cn("border-2 transition-all cursor-pointer bg-card", filterStatus === s.status ? "border-primary ring-2 ring-primary/10" : "border-border/50")}>
            <CardContent className="p-3 text-center">
              <s.icon size={16} className={cn("mx-auto mb-1", filterStatus === s.status ? s.color : "text-muted-foreground")} />
              <p className={cn("text-xl font-headline font-bold", filterStatus === s.status ? s.color : "text-foreground")}>{s.val}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input placeholder={`Cari ${activeTab === 'recipients' ? 'penerima' : 'hewan'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 h-12 border-2 rounded-xl bg-card shadow-sm" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted p-1 rounded-xl border-2 mb-4">
          <TabsTrigger value="recipients" className="rounded-lg text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white h-full">Penerima</TabsTrigger>
          <TabsTrigger value="animals" className="rounded-lg text-xs font-bold uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white h-full">Hewan</TabsTrigger>
        </TabsList>

        <TabsContent value="recipients" className="flex-1 flex flex-col mt-0">
          <div className="bg-card rounded-2xl border-2 overflow-hidden shadow-sm">
            <ScrollArea className="h-[50vh]">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[80px] font-bold text-primary uppercase text-[9px]">Kupon</TableHead>
                    <TableHead className="font-bold text-primary uppercase text-[9px]">Penerima</TableHead>
                    <TableHead className="text-right font-bold text-primary uppercase text-[9px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.map((person: Recipient) => (
                    <TableRow key={person.id} className="hover:bg-primary/5">
                      <TableCell className="font-mono font-bold text-xs">{person.id}</TableCell>
                      <TableCell>
                        <div className="font-bold text-sm">{person.name}</div>
                        <Badge variant={person.status === 'Sudah' ? 'secondary' : 'outline'} className="text-[8px] h-4 mt-1">
                          {person.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => handleShowDetailRecipient(person)}>
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => handleOpenRecipientDialog(person)}>
                            <Pencil size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="animals" className="space-y-3 mt-0">
          <ScrollArea className="h-[50vh]">
            <div className="grid gap-3">
              {filteredAnimals.map((animal: Animal, i: number) => (
                <div key={i} className="bg-card p-4 rounded-2xl border-2 shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border-2", animal.type === 'Sapi' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' : 'bg-blue-500/10 border-blue-500/20 text-blue-600')}>
                      <Beef size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary">{animal.id}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase">{animal.donor} • {animal.weight}kg</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" onClick={() => handleShowDetailAnimal(animal)}>
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" onClick={() => handleOpenAnimalDialog(animal)}>
                      <Pencil size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={isRecipientDialogOpen} onOpenChange={setIsRecipientDialogOpen}>
        <DialogContent className="rounded-t-3xl sm:rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-primary">{isEditing ? "Ubah Penerima" : "Tambah Penerima"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nomor Kupon</Label>
              <Input disabled={isEditing} inputMode="numeric" placeholder="0101021" value={newRecipient.id} onChange={(e) => setNewRecipient({...newRecipient, id: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input placeholder="Nama" value={newRecipient.name} onChange={(e) => setNewRecipient({...newRecipient, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input placeholder="Blok/RT" value={newRecipient.address} onChange={(e) => setNewRecipient({...newRecipient, address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Textarea placeholder="Catatan..." value={newRecipient.note} onChange={(e) => setNewRecipient({...newRecipient, note: e.target.value})} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveRecipient} className="w-full bg-primary h-12 font-bold uppercase">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAnimalDialogOpen} onOpenChange={setIsAnimalDialogOpen}>
        <DialogContent className="rounded-t-3xl sm:rounded-3xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-primary">{isEditing ? "Ubah Data Hewan" : "Daftar Hewan"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tag Hewan</Label>
              <Input disabled={isEditing} placeholder="SAPI-01" value={newAnimal.id} onChange={(e) => setNewAnimal({...newAnimal, id: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Nama Pekurban</Label>
              <Input placeholder="Hamba Allah" value={newAnimal.donor} onChange={(e) => setNewAnimal({...newAnimal, donor: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis</Label>
                <Input placeholder="Sapi/Kambing" value={newAnimal.type} onChange={(e) => setNewAnimal({...newAnimal, type: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Berat (kg)</Label>
                <Input type="number" placeholder="250" value={newAnimal.weight} onChange={(e) => setNewAnimal({...newAnimal, weight: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lokasi / Alamat</Label>
              <Input placeholder="Alamat..." value={newAnimal.address} onChange={(e) => setNewAnimal({...newAnimal, address: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea placeholder="Catatan..." value={newAnimal.note} onChange={(e) => setNewAnimal({...newAnimal, note: e.target.value})} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveAnimal} className="w-full bg-primary h-12 font-bold uppercase">Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold text-primary text-center">Detail {detailItem?.type === 'recipient' ? 'Penerima' : 'Hewan'}</DialogTitle></DialogHeader>
          {detailItem && detailItem.type === 'recipient' && (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-primary/20 flex flex-col items-center gap-3">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${detailItem.data.id}`} alt="QR Code" width="200" height="200" className="mx-auto" />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs font-bold" 
                    onClick={async () => {
                      try {
                        const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${detailItem.data.id}`);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `QR_Kupon_${detailItem.data.id}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch {
                        toast({ title: "Gagal Mengunduh", description: "Terjadi kesalahan saat mengunduh QR Code.", variant: "destructive" });
                      }
                    }}
                  >
                    <Download size={14} className="mr-2" /> Simpan QR
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Nomor Kupon</span>
                  <span className="font-mono font-bold text-lg">{detailItem.data.id}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Nama Penerima</span>
                  <span className="font-bold">{detailItem.data.name}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Alamat</span>
                  <span className="font-medium text-right max-w-[60%] text-sm">{detailItem.data.address || '-'}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Keterangan</span>
                  <span className="font-medium text-right max-w-[60%] text-sm">{detailItem.data.note || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Status</span>
                  <Badge variant={detailItem.data.status === 'Sudah' ? 'secondary' : 'outline'}>{detailItem.data.status}</Badge>
                </div>
              </div>
            </div>
          )}
          {detailItem && detailItem.type === 'animal' && (
            <div className="space-y-4 py-4">
               <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Tag Hewan</span>
                  <span className="font-mono font-bold">{detailItem.data.id}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Pekurban</span>
                  <span className="font-bold">{detailItem.data.donor}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Jenis / Berat</span>
                  <span className="font-medium">{detailItem.data.type} • {detailItem.data.weight}kg</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Lokasi / Alamat</span>
                  <span className="font-medium text-right max-w-[60%] text-sm">{detailItem.data.address || '-'}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Catatan</span>
                  <span className="font-medium text-right max-w-[60%] text-sm">{detailItem.data.note || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Status</span>
                  <Badge variant="outline">{detailItem.data.status}</Badge>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CouponPrintTemplate ref={printRef} recipients={filteredRecipients} />
      <BottomNav />
    </div>
  );
}
