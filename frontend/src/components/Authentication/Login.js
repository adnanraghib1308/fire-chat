import React, {useState} from "react";
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from "@chakra-ui/react";
import axios from 'axios';
import {useHistory} from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [show, setShow] = useState();
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const toast = useToast();

    const submitHandler = async () => {
        setLoading(true);
        if(!email || !password) {
            toast({
                title: "Please fill all the fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post("/api/user/login", {email, password});
            toast({
                title: "You are loged in",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })

            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            history.push('/chats')
            return;
        } catch (error) {
            toast({
                title: "Error Occured",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setLoading(false);
        }
    }
    return (
        <VStack spacing={'5px'} color='black'>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input 
                        type={show ? "text" : "password"}
                        placeholder="Enter password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={() => setShow(!show)}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <Button
                width={'100%'}
                colorScheme='blue'
                style={{marginTop: 15}}
                onClick={submitHandler}
                isLoading={loading}
            > Log In
            </Button>
            <Button 
                variant={'solid'}
                colorScheme='red'
                width={'100%'}
                onClick = {() => {
                    setEmail("guest@example.com");
                    setPassword("123456")
                }}
            >Get Guest User Credentials
            </Button>
        </VStack>
    )
}

export default Login;