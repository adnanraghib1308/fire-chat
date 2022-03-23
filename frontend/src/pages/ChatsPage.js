import React, { useEffect, useState } from "react";
import axios from 'axios';
import { ChatState } from "../context/chatProvider";
import Navbar from '../components/Others/Navbar';
import MyChats from '../components/Others/MyChats';
import ChatBox from '../components/Others/ChatBox';
import { Box } from "@chakra-ui/react";

const ChatPage = () => {

  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{width: '100%'}}>
        <Navbar />
        <Box
          display={'flex'}
          justifyContent={'space-between'}
          width={'100%'}
          height={'91.5vh'}
          p='10px'
        >
          <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
        </Box>
    </div> 
  )
}

export default ChatPage;