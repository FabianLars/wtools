import { promisified } from 'tauri/api/tauri';

import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Flex, Input, Text, useToast } from '@chakra-ui/react';

import Header from '../components/sections/Header';

const Account = ({ user, setUser }) => {
    const [wurl, setWurl] = useState('https://leagueoflegends.fandom.com/de/api.php');
    const [lgname, setLgname] = useState('');
    const [lgpasswd, setLgpasswd] = useState('');
    const [logginin, setLoggingin] = useState(false);
    const [persistent, setPersistent] = useState(false);
    const toast = useToast();

    const login = () => {
        setLoggingin(true);
        promisified({
            cmd: 'login',
            loginname: lgname,
            password: lgpasswd,
            wikiurl: wurl,
            is_persistent: persistent,
        })
            .then((res) => {
                console.log(res);
                setLoggingin(false);
                setUser({
                    loggedin: true,
                    isPersistent: persistent,
                    username: res.username,
                    password: lgpasswd,
                    url: res.url,
                });
            })
            .catch((err) => {
                setLoggingin(false);
                console.error(err);
                toast({
                    title: "Can't log in!",
                    description: 'Check your input!',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
            });
    };

    useEffect(() => {
        if (typeof window.__TAURI_INVOKE_HANDLER__ === 'function') {
            if (user.loggedin) {
                setLgname(user.username);
                setPersistent(user.isPersistent);
                setLgpasswd(user.password);
                setWurl(user.url);
            } else {
                promisified({
                    cmd: 'init',
                })
                    .then((res) => {
                        console.log(res);
                        const { wikiurl, loginname, password, is_persistent } = res;
                        if (wikiurl !== '') setWurl(res.wikiurl);
                        setLgname(loginname);
                        setLgpasswd(password);
                        setPersistent(is_persistent);
                    })
                    .catch((err) => console.error(err));
            }
        }
        // eslint-disable-next-line
    }, []);

    return (
        <Flex direction="column" align="center" maxW={{ xl: '1240px' }} m="0 auto" h="100vh">
            <Header />

            <Flex
                as="main"
                direction="column"
                align="center"
                maxW={{ xl: '1200px' }}
                m="0 auto"
                w="50%"
                h="100%"
                justify="center"
            >
                <Text fontSize="xl" align="center">
                    {user.loggedin ? user.username : ''}
                </Text>
                <Text fontSize="xl" mb={2} align="center">
                    {user.loggedin ? user.url : 'Not logged in!'}
                </Text>
                <Input
                    mb={2}
                    value={wurl}
                    onChange={(event) => setWurl(event.target.value)}
                    placeholder="Wiki URL (pointing to api.php => 'https://leagueoflegends.fandom.com/api.php')"
                    isRequired
                />
                <Input
                    mb={2}
                    value={lgname}
                    onChange={(event) => setLgname(event.target.value)}
                    placeholder="Loginname via S:BotPasswords"
                    isRequired
                />
                <Input
                    mb={2}
                    value={lgpasswd}
                    onChange={(event) => setLgpasswd(event.target.value)}
                    type="password"
                    placeholder="Password via S:BotPasswords"
                    isRequired
                />
                <Flex direction="row" w="100%" justify="flex-end">
                    <Checkbox isChecked={persistent} onChange={(event) => setPersistent(event.target.checked)}>
                        Stay logged in
                    </Checkbox>
                    <Button ml={2} isLoading={logginin} onClick={login}>
                        Login
                    </Button>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Account;
