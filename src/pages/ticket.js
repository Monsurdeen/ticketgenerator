import { useEffect, useState, useRef } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import JsBarcode from 'jsbarcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Ticket() {
  const [user, setUser] = useState(null);
  const barcodeRef = useRef(null);
  const ticketRef = useRef(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('ticketUser'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (user?.email && barcodeRef.current) {
      JsBarcode(barcodeRef.current, user.email, {
        format: 'CODE128',
        lineColor: '#000',
        background: '#fff',
        width: 2,
        height: 60,
        displayValue: false,
      });
    }
  }, [user]);

  const downloadPDF = () => {
    if (ticketRef.current) {
      html2canvas(ticketRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
        pdf.save('ticket.pdf');
      });
    }
  };

  if (!user) return <p className="text-white text-center">Loading ticket...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0C343C] text-white">
      <h2 className="text-2xl font-semibold">Your Ticket is Booked.</h2>
      <p className="mt-2 text-gray-400">
        Check your email for a copy or you can 
        <span 
          className="font-bold text-white cursor-pointer underline" 
          onClick={downloadPDF}
        > download</span>
      </p>

      <div ref={ticketRef} className="relative mt-6 bg-[#124853] border-2 border-blue-400 rounded-lg p-4 w-[350px] sm:w-[400px]">
        <h3 className="text-xl font-bold text-center text-blue-300 italic">Techember Fest '25</h3>
        <div className="flex items-center justify-center mt-2 text-sm text-gray-300">
          <MapPin className="w-4 h-4 text-red-400 mr-1" />
          04 Rumens Road, Ikoyi, Lagos
        </div>
        <div className="flex items-center justify-center mt-1 text-sm text-gray-300">
          <Calendar className="w-4 h-4 text-red-400 mr-1" />
          March 15, 2025 | 7:00 PM
        </div>

        {/* User Profile Image */}
        <div className="flex justify-center mt-4">
          <div className="w-48 h-48 border-2 border-blue-400 rounded-lg overflow-hidden">
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Ticket Details */}
        <div className="mt-4 bg-[#0c2e35] p-4 rounded-lg text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Name</p>
              <p className="font-semibold">{user.name || "Guest"}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="font-semibold">{user.email || "Not Provided"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-gray-400">Ticket Type:</p>
              <p className="font-semibold">VIP</p>
            </div>
            <div>
              <p className="text-gray-400">Ticket for:</p>
              <p className="font-semibold">1</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-gray-400">Special request?</p>
            <p className="text-gray-300">{user.specialRequest || "Nil"}</p>
          </div>
        </div>

        {/* Barcode */}
        <div className="flex flex-col items-center mt-4 bg-white rounded-lg border border-blue-400 p-4">
          <svg ref={barcodeRef} className="w-full h-20"></svg>
          <p className="text-xs tracking-widest font-mono mt-2 text-black"> {user?.ticketId || 'TICKET12345'}</p>

        </div>
      </div>
    </div>
  );
}
