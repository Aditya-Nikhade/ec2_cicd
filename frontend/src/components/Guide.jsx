import React, { useState } from "react";

const Guide = () => {
  const [open, setOpen] = useState(true);

  return (
    <div
      className="absolute top-8 left-8 z-10 w-[calc(100%-4rem)] max-w-none min-w-[220px] p-0 rounded-lg shadow-[4px_4px_0_0_#000] border-2 border-black bg-[#fff200]"
      style={{ fontFamily: 'Inter, Arial, sans-serif', right: '2rem' }}
    >
      <button
        className="flex items-center justify-between w-full px-6 py-4 cursor-pointer select-none focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="guide-content"
        style={{ background: 'none', border: 'none' }}
      >
        <span className="text-2xl font-extrabold text-black tracking-tight">Guide (For Recruiters)</span>
        <svg
          className={`ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 10l5 5 5-5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div
        id="guide-content"
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[500px] py-4 px-6' : 'max-h-0 py-0 px-6'}`}
        style={{}}
      >
        <ul className="text-base text-black font-medium space-y-2">
          <li>
            <strong>1. Create an account with manual signup or Google signup.</strong>
          </li>
          <li>
            <strong>2. Go to the &quot;Chats&quot; tab, a dummy user is already added as a friend.</strong>
          </li>
          <li>
            <strong>3. You can chat with him/her, send images/pdfs now.</strong>
          </li>
          <li>
            <strong>4. <u>To view THE real-time functionality</u>, login as a dummy user from another browser or another Google account.</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Guide; 