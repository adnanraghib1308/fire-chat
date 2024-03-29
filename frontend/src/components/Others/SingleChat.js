import { ChatState } from "../../context/chatProvider";
import {Box, Text, IconButton, Spinner, FormControl, Input, useToast} from '@chakra-ui/react';
import {ArrowBackIcon} from '@chakra-ui/icons';
import { getSender, getSenderDetail } from "../../config/chatLogics";
import ProfileModal from "./ProfileModal";
import UpdateGroupChatModal from "./UpdateGroupChatModal";
import {useState, useEffect} from 'react';
import axios from 'axios';
import "./styles.css";
import ScrollableChat from "./ScorabbleChat";
import io from 'socket.io-client';
import Lottie from "lottie-react";
import animationData from '../../animations/typing.json';

var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);

    const { selectedChat, setSelectedChat, notifications, setNotifications } = ChatState();
    const user = JSON.parse(localStorage.getItem('userInfo'));

    const toast = useToast();

    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };


    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };

          setLoading(true);

          const { data } = await axios.get(
            `/api/message/${selectedChat._id}`,
            config
          );
          setMessages(data);
          setLoading(false);

          socket.emit("join chat", selectedChat._id);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to Load the Messages",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
    }
    const sendMessage = async (e) => {
        if(e.key === 'Enter' && newMessage){
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                  headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                  },
                };

                setNewMessage("");
                const { data } = await axios.post(
                  "/api/message",
                  {
                    content: newMessage,
                    chatId: selectedChat._id,
                  },
                  config
                );

                setFetchAgain(!fetchAgain);
                
                socket.emit("new message", data);
                setMessages([...messages, data]);
              } catch (error) {
                toast({
                  title: "Error Occured!",
                  description: "Failed to send the Message",
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                  position: "bottom",
                });
              }
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socketConnected) return;

        if (!typing) {
          setTyping(true);
          socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
          var timeNow = new Date().getTime();
          var timeDiff = timeNow - lastTypingTime;
          if (timeDiff >= timerLength && typing) {
            socket.emit("stop typing", selectedChat._id);
            setTyping(false);
          }
        }, timerLength);
    };

    useEffect(() => {
      socket = io(process.env.REACT_APP_SOCKET_URL);
      socket.emit("setup", user);
      socket.on('connected', () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));
    }, [])

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
      socket.on("message recieved", (newMessage) => {
        if (
          !selectedChatCompare || // if chat is not selected or doesn't match current chat
          selectedChatCompare._id !== newMessage.chat._id
        ) {
          //send notification
          setNotifications([newMessage, ...notifications]);
          setFetchAgain(!fetchAgain);
        } else {
          setMessages([...messages, newMessage]);
        }
      })
    })

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        d="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            d={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal user={getSenderDetail(user, selectedChat.users)} />
                            </>
                        ) : (
                            <>
                                {selectedChat.chatName.toUpperCase()}
                                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} chatName={selectedChat.chatName} />
                            </>
                        )
                        }
                    </Text>
                    <Box
                        d="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Spinner
                                size="xl"
                                w={20}
                                h={20}
                                alignSelf="center"
                                margin="auto"
                          />
                        ) : (
                            <div className="messages">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}
                        <FormControl
                            onKeyDown={sendMessage}
                            isRequired
                            mt={3}
                        >
                            {istyping ? (
                              <div>
                                <Lottie animationData={animationData} 
                                  style={{ marginBottom: 15, marginLeft: 0, height: "50px", width: '70px' }}
                                />
                              </div>
                            ) : (
                              <></>
                            )}
                            <Input
                                variant="filled"
                                bg="#E0E0E0"
                                placeholder="Enter a message.."
                                value={newMessage}
                                onChange={typingHandler}
                            />
                        </FormControl>
                    </Box>
                </>
            ): (
                    <Box d="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                            Click on a user to start chatting
                        </Text>
                    </Box>
                )
            }
        </>
    )
}

export default SingleChat;