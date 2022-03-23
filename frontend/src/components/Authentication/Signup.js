import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, useToast, VStack, } from "@chakra-ui/react";
import React, { useState } from "react";
import axios from 'axios';
import {useHistory} from 'react-router-dom';

const Signup = () => {

    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [picture, setPicture] = useState();
    const [show, setShow] = useState();
    const [loading, setLoading] = useState(false);
    const history = useHistory();
    const toast = useToast();

    const postDetail = (pic) => {
        setLoading(true);
        if(pic === undefined){
            toast({
                title: "Please select an image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return;
        }
        if(pic.type === 'image/jpeg' || pic.type === 'image/png') {
            const data = new FormData();
            data.append('file', pic);
            data.append('upload_preset', 'firechat');
            data.append("cload_name", "ddqrt3cez");
            fetch("https://api.cloudinary.com/v1_1/ddqrt3cez/image/upload", {
                method: 'post',
                body: data
            }).then(res => res.json())
            .then(data => {
                setPicture(data.url.toString());
                setLoading(false);
            }).catch(error => {
                console.log("Error: ", error);
                setLoading(false);
            }) 
        } else {
            toast({
                title: "Please select an image",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return;
        }
    }
    const submitHandler = async () => {
        setLoading(true);
        if(!name || !email || !password || !confirmPassword) {
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
        if(password !== confirmPassword){
            toast({
                title: "Passwords do not match",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post("/api/user", {name, email, password, pic: picture});
            toast({
                title: "Registration is successfull",
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
            <FormControl id='first-name' isRequired>
                <FormLabel>Name</FormLabel>
                <Input 
                    placeholder="Enter your Name"
                    onChange={(e) => setName(e.target.value)}
                />
            </FormControl>
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input 
                        type={show ? "text" : "password"}
                        placeholder="Enter password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={() => setShow(!show)}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='confirm-password' isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input 
                        type={show ? "text" : "password"}
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={() => setShow(!show)}>
                            {show ? "Hide" : "Show"}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl id='pic'>
                <FormLabel>Upload your photo</FormLabel>
                <Input 
                    type='file'
                    p={1.5}
                    accept='image/*'
                    onChange={(e) => postDetail(e.target.files[0])}
                />
            </FormControl>
            <Button
                width={'100%'}
                colorScheme='blue'
                style={{marginTop: 15}}
                onClick={submitHandler}
                isLoading={loading}
            >Sign Up
            </Button>
        </VStack>
    )
}

export default Signup;