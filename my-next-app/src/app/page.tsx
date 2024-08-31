// Example in a React component

'use client'
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { socket } from "../socket";

function HomePage() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const roomNameRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<string[]>([]);
  const [roomName, setRoomName] = useState<string>('');


  const sendChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current) {
      const inputText = inputRef.current.value;
      setMessage(inputText);
      socket.emit("chat", { chat: inputText, roomName });
      inputRef.current.value = "";
    }
  };


  const onChangeHandleInputText = () => {
    if (inputRef.current) {
      const inputText = inputRef.current.value;
      socket.emit("chat", { chat: inputText, roomName: roomName });
      console.log([inputRef.current.value])
    }


  };




  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomNameRef.current) {
      const roomName = roomNameRef.current.value;
      setRoomName(roomName);
      socket.emit("joinRoom", roomName);
    }
  };

  useEffect(() => {
    socket.on("chat", (payload) => {
      if (inputRef.current) {
        inputRef.current.value = payload;
      }
    });

    socket.on("newJoin", (payload) => {
      // const inputText = payload;

      // socket.emit("chat", { chat: payload, roomName: roomName });
      // alert(payload)
      if (inputRef.current) {
        inputRef.current.value = payload;
        console.log(payload)
      }
    })

    return () => {
      socket.off("chat");
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">Chat Room</h1>

        <form onSubmit={joinRoom} className="flex mb-4">
          <input
            ref={roomNameRef}
            type="text"
            placeholder="Enter Room Name"
            className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:border-blue-500"
          />
          <button  
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          >
            Join
          </button>
        </form>

        <div className="h-68 w-full overflow-y-auto border p-4 rounded mb-4 bg-gray-50">
          <textarea
            ref={inputRef}

            onChange={onChangeHandleInputText}
            placeholder="Type a message..."
            className="resize-none h-60 w-full  p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
        </div>


      </div>
    </div>
  );
};

export default HomePage;
