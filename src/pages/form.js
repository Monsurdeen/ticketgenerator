import { useState } from 'react';
import { useRouter } from 'next/router';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Upload } from '../components/ui/Upload';

export default function FormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [specialRequest, setSpecialRequest] = useState('');

  const handleSubmit = () => {
    if (!name || !email) {
      alert('Please fill in all required fields.');
      return;
    }

    // Save user data in localStorage
    const userData = { name, email, avatar, specialRequest };
    localStorage.setItem('ticketUser', JSON.stringify(userData));

    // Redirect to ticket page
    router.push('/ticket');
  };

  return (
    <div className="min-h-screen bg-[#0c3035] text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-[#12464E] p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Complete Your Profile</h2>

        {/* Upload Profile Photo */}
        <div className="mb-4">
          <label className="block text-gray-300">Upload Profile Photo</label>
          <Upload
            onChange={(file) => {
              const fileURL = URL.createObjectURL(file);
              setAvatar(fileURL);
            }}
            className="mt-2 border border-gray-500 p-6 text-center rounded-lg cursor-pointer hover:border-blue-400 transition"
          >
            Drag & drop or click to upload
          </Upload>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-gray-300">Enter your name</label>
          <Input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-500 rounded-lg bg-[#08252B] text-white"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-gray-300">Enter your email *</label>
          <Input
            type="email"
            placeholder="hello@aviolagos.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-500 rounded-lg bg-gray-800 text-white"
          />
        </div>

        {/* Special Request */}
        <div className="mb-4">
          <label className="block text-gray-300">Special request?</label>
          <textarea
            placeholder="Textarea"
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-500 rounded-lg bg-gray-800 text-white h-24"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="bg-blue-400 hover:bg-blue-500 px-6 py-2">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
