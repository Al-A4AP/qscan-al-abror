import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Recipient } from '../api';

interface Props {
  recipients: Recipient[];
}

export const CouponPrintTemplate = forwardRef<HTMLDivElement, Props>(({ recipients }, ref) => {
  // Kelompokkan penerima per 5 data untuk 1 halaman A4
  const chunks: Recipient[][] = [];
  for (let i = 0; i < recipients.length; i += 5) {
    chunks.push(recipients.slice(i, i + 5));
  }

  return (
    <div className="hidden">
      <div ref={ref} className="bg-white text-black p-0 m-0">
        <style type="text/css" media="print">
          {`
            @page { size: A4 portrait; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            div.page-break:not(:last-child) { page-break-after: always; break-after: page; }
          `}
        </style>
        
        {chunks.map((chunk, pageIndex) => (
          <div key={pageIndex} className="page-break flex flex-col justify-start gap-[5mm] pb-[5mm]">
            {chunk.map((r) => (
              <div key={r.id} className="w-full h-[50mm] border-2 border-dashed border-gray-600 flex rounded-xl overflow-hidden box-border bg-white">
                {/* Left Side: Branding & Details */}
                <div className="flex-1 p-5 flex flex-col justify-center border-r-2 border-dashed border-gray-400 relative">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                  <h2 className="text-xl font-black uppercase tracking-widest mb-1 text-primary ml-3 mt-1">KUPON AL-ABROR QR</h2>
                  <div className="ml-3 flex flex-col justify-between flex-1 pb-1">
                    <div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Penerima</div>
                      <div className="text-lg font-bold text-gray-900 leading-none">{r.name}</div>
                      
                      <div className="flex gap-4 mt-1.5">
                        <div className="text-[9px] text-gray-800"><span className="font-bold">Alamat:</span> {r.address || '-'}</div>
                        <div className="text-[9px] text-gray-800"><span className="font-bold">Keterangan:</span> {r.note || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="text-[9px] text-gray-800 leading-tight pr-2 mt-1.5 pt-1.5 border-t border-dashed border-gray-300">
                      <span className="font-bold">Lokasi:</span> Masjid Al-Abror Jl. Jamrud No. 7 Kel. Cisaranten Kulon Kec. Arcamanik Kota Bandung.
                      <br/>
                      <span className="font-bold">Waktu Pembagian Daging Qurban:</span> Hari Rabu, 27 Mei 2026 (13:00 WIB - 16:00 WIB)
                    </div>
                  </div>
                </div>
                
                {/* Right Side: QR Code */}
                <div className="w-[60mm] flex flex-col items-center justify-center bg-gray-50 p-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm border">
                    <QRCodeSVG value={r.id} size={110} level="H" />
                  </div>
                  <span className="text-3xl mt-1 font-mono tracking-widest font-black text-gray-900">{r.id}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
