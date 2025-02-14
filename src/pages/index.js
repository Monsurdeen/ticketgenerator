import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage';


export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [ticketType, setTicketType] = useState('Free');
  const [selectedTickets, setSelectedTickets] = useState('1');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(getFromLocalStorage('name') || '');
    setEmail(getFromLocalStorage('email') || '');
    setAvatar(getFromLocalStorage('avatar') || '');
  }, []);

  const handleNext = () => {
    saveToLocalStorage('ticketType', ticketType);
    saveToLocalStorage('selectedTickets', selectedTickets);
    router.push('/form');
  };

  return (
    <div className="min-h-screen bg-[#09252b] text-white px-4"> 
      {/* Header */}
      <header className="py-6 text-center text-2xl font-bold border-b border-gray-700">Ticket Selection</header>
      
      {/* Step Indicator */}
      <div className="w-full h-1 bg-gray-700 mt-2">
        <div className="w-1/3 h-1 bg-blue-400"></div>
      </div>
      
      {/* Ticket Selection Section */}
      <section className="max-w-2xl mx-auto my-8 bg-[#0C343C] p-6 rounded-lg shadow-lg">
        <div className="bg-[#124853] p-7 rounded-xl text-center shadow-md">
          <h2 className="text-3xl font-bold font-serif">Techember Fest '25</h2>
          <p className="mt-2 text-gray-300">Join us for an unforgettable experience at [Event Name]! Secure your spot now.</p>
          <p className="mt-4 text-gray-300">📍 [Event Location] || March 15, 2025 | 7:00 PM</p>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Select Ticket Type:</h3>
          <div className="flex gap-4 border border-gray-500 rounded-xl p-4">
            {['Free', '$150 VIP', '$150 VVIP'].map((type, index) => (
              <button 
                key={type} 
                onClick={() => setTicketType(type)} 
                className={`flex-1 p-4 rounded-xl ${ticketType === type ? 'bg-[#12464E] text-white shadow-lg' : ''} text-center transition hover:bg-blue-500 ${index > 0 ? 'border-l border-gray-500' : ''} ${index < 2 ? 'border-r border-gray-500' : ''}`}
              >
                {type} <br /><span className="text-sm">{type === 'Free' ? 'Regular Access' : 'Premium Access'}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Number of Tickets</h3>
          <select
            value={selectedTickets}
            onChange={(e) => setSelectedTickets(e.target.value)}
            className="w-full p-2 border border-gray-500 rounded-lg bg-gray-800 focus:ring-2 focus:ring-blue-400 text-white"
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num} className="text-black">{num}</option>
            ))}
          </select>
          <p className="mt-2 text-lg">Selected Tickets: {selectedTickets}</p>
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button className="bg-gray-600 hover:bg-gray-700 px-6 py-2">Cancel</Button>
          <Button onClick={handleNext} className="bg-[#12464E] hover:bg-blue-500 px-6 py-2">Next</Button>
        </div>  
      </section>
    </div>
  );
}
