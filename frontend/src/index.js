import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import {BrowserRouter} from 'react-router-dom';
import ChatProvider from './context/chatProvider';

ReactDOM.render(
  
  
    <BrowserRouter>
      <ChakraProvider>
      <ChatProvider>
        <App />
      </ChatProvider> 
      </ChakraProvider> 
    </BrowserRouter> ,
  document.getElementById('root')
);
