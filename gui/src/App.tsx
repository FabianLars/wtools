import React, { useEffect, useRef, useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/tauri';
import { Account, Delete, Download, Edit, List, Move, Purge, Upload } from './pages';
import { Center, Flex } from '@chakra-ui/react';
import { Header } from './components';

export type Profile = {
    profile: string;
    username: string;
    password: string;
    url: string;
    savePassword: boolean;
    isOnline: boolean;
};

const App = () => {
    // useRef to make useEffect skip the change from useState
    const mounted = useRef(false);
    // Init dummy object to prevent errors on startup
    const [profiles, setProfiles] = useState<Profile[]>([
        {
            profile: '',
            username: '',
            password: '',
            url: '',
            savePassword: false,
            isOnline: false,
        },
    ]);
    const [currentProfile, setCurrentProfile] = useState(0);
    const [navDisabled, setNavDisabled] = useState(false);
    const [oldProfilesLen, setOldProfilesLen] = useState(1);

    // Init user state from cache or default
    // This exists to handle reloads
    useEffect(() => {
        if (!!window.__TAURI__) {
            (async () => {
                setNavDisabled(true);
                const cache: Profile[] | null = await invoke('cache_get', { key: 'profiles' });
                if (cache) {
                    setProfiles(cache);
                } else {
                    const init: [Profile[], number] = await invoke('init');
                    if (init[0].some((p) => p.profile !== '' && p.url !== '')) {
                        setProfiles(init[0]);
                        setCurrentProfile(init[1] || 0);
                    }
                }
                setNavDisabled(false);
            })();
        }
    }, []);

    // Update cache on every user object change
    // This exists to handle reloads
    useEffect(() => {
        if (mounted.current) {
            invoke('cache_set', {
                key: 'profiles',
                value: profiles,
            });
            // OnProfileRemoved
            if (profiles.length < oldProfilesLen) {
                invoke('update_profile_store', { profiles, current: 0 });
            }
            setOldProfilesLen(profiles.length);
        } else {
            mounted.current = true;
        }
    }, [profiles]);

    return (
        <Router>
            <Flex direction="column" h="100vh" w="100vw" userSelect="none">
                <Header isDisabled={navDisabled} isOnline={profiles[currentProfile].isOnline} />
                <Center flex="1 1 auto" overflow="hidden" p={4}>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Account
                                    profiles={profiles}
                                    setProfiles={setProfiles}
                                    currentProfile={currentProfile}
                                    setCurrentProfile={setCurrentProfile}
                                    setNavDisabled={setNavDisabled}
                                />
                            }
                        />
                        <Route
                            path="/Delete"
                            element={
                                <Delete
                                    isOnline={profiles[currentProfile].isOnline}
                                    setNavDisabled={setNavDisabled}
                                />
                            }
                        />
                        <Route
                            path="/Download"
                            element={
                                <Download
                                    isOnline={profiles[currentProfile].isOnline}
                                    setNavDisabled={setNavDisabled}
                                />
                            }
                        />
                        <Route
                            path="/Edit"
                            element={
                                <Edit
                                    isOnline={profiles[currentProfile].isOnline}
                                    setNavDisabled={setNavDisabled}
                                />
                            }
                        />
                        <Route
                            path="/List"
                            element={
                                <List
                                    isOnline={profiles[currentProfile].isOnline}
                                    setNavDisabled={setNavDisabled}
                                />
                            }
                        />
                        <Route
                            path="/Move"
                            element={
                                <Move
                                    isOnline={profiles[currentProfile].isOnline}
                                    setNavDisabled={setNavDisabled}
                                />
                            }
                        />
                        <Route
                            path="/Purge"
                            element={
                                <Purge
                                    isOnline={profiles[currentProfile].isOnline}
                                    setNavDisabled={setNavDisabled}
                                />
                            }
                        />
                        <Route
                            path="/Upload"
                            element={
                                <Upload
                                    isOnline={profiles[currentProfile].isOnline}
                                    setNavDisabled={setNavDisabled}
                                />
                            }
                        />
                    </Routes>
                </Center>
            </Flex>
        </Router>
    );
};

export default App;
