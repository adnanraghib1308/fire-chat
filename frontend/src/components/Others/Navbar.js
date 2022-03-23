import { Box, Button, Tooltip, Text, Menu, MenuButton, MenuList, Avatar, MenuItem, MenuDivider, Input, Spinner, toast } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useState } from "react";
import { ChatState } from "../../context/chatProvider";
import ProfileModal from "./ProfileModal";
import { useHistory } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/hooks";
import axios from "axios";
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
  } from "@chakra-ui/modal";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import {getSender} from '../../config/chatLogics';
import "./styles.css"
// import NotificationBadge from "react-notification-badge";
// import { Effect } from "react-notification-badge";


const Navbar = () => {
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const { setSelectedChat, chats, setChats, notifications, setNotifications } = ChatState();

    const history = useHistory();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const user = JSON.parse(localStorage.getItem('userInfo'));

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push("/");
    };

    const handleSearch = async () => {
        if (!search) {
          toast({
            title: "Please Enter something in search",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-left",
          });
          return;
        }
    
        try {
          setLoading(true);
    
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
    
          const { data } = await axios.get(`/api/user?search=${search}`, config);
    
          setLoading(false);
          setSearchResult(data);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to Load the Search Results",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      };

      const accessChat = async (userId) => {
    
        try {
          setLoadingChat(true);
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.post(`/api/chat`, { userId }, config);
    
          if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
          setSelectedChat(data);
          setLoadingChat(false);
          onClose();
        } catch (error) {
          toast({
            title: "Error fetching the chat",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      };

    return (
        <>
            <Box
                d="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                w="100%"
                p="5px 10px 5px 10px"
                borderWidth="5px"
            >
                <Tooltip label="Search Users To Chat" hasArrow placement="bottom-end" >
                    <Button variant={'ghost'} onClick={onOpen}>
                        <i className="fas fa-search"></i>
                        <Text d={{base: 'none', md:'flex'}} px='4px'>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>   
                <Text fontSize="2xl" fontFamily="Work sans">
                    Fire Chat
                </Text> 
                <div>
                    <Menu>
                        <MenuButton p={1} marginRight={30}>
                            <BellIcon color={ notifications.length > 0 ? 'red' : ''} fontSize={'2xl'} m={1}/>
                            {notifications.length > 0 && <span className="badge">{notifications.length}</span> }
                        </MenuButton>
                        <MenuList>
                          {!notifications.length && "No New Messages"}
                          {notifications.map((notif) => (
                            <MenuItem
                              key={notif._id}
                              onClick={() => {
                                setSelectedChat(notif.chat);
                                setNotifications(notifications.filter((n) => n !== notif));
                              }}
                            >
                              {notif.chat.isGroupChat
                                ? `New Message in ${notif.chat.chatName}`
                                : `New Message from ${getSender(user, notif.chat.users)}`}
                            </MenuItem>
                          ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size="sm"
                                cursor="pointer"
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Log Out</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>
            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                    <DrawerContent>
                      <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                      <DrawerBody>
                        <Box d="flex" pb={2}>
                          <Input
                            placeholder="Search by name or email"
                            mr={2}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                          <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                          <ChatLoading />
                        ) : (
                          searchResult?.map((user) => (
                            <UserListItem
                              key={user._id}
                              user={user}
                              handleFunction={() => accessChat(user._id)}
                            />
                          ))
                        )}
                        {loadingChat && <Spinner ml="auto" d="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default Navbar;