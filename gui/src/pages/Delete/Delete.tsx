import { Box, Button, Flex, Input, Textarea, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

type Props = {
    isOnline: boolean;
    setNavDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const Delete = ({ isOnline, setNavDisabled }: Props) => {
    const [areaValue, setAreaValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [reason, setReason] = useState('');
    const toast = useToast();

    const deletePages = () => {
        setIsLoading(true);
        invoke('delete', {
            pages: areaValue.split(/\r?\n/),
            reason,
        })
            .then(() =>
                toast({
                    title: 'Delete successful',
                    description: 'Delete successful',
                    status: 'success',
                    isClosable: true,
                }),
            )
            .catch((err) =>
                toast({
                    title: `Something went wrong! ${err.code}-Error`,
                    description: err.description,
                    status: 'error',
                    duration: 10000,
                    isClosable: true,
                }),
            )
            .finally(() => setIsLoading(false));
    };

    useEffect(() => setNavDisabled(isLoading), [isLoading]);

    useEffect(() => {
        (invoke('cache_get', { key: 'delete-reason' }) as Promise<string | null>).then((res) =>
            setReason(res ?? ''),
        );
    }, []);

    return (
        <Flex direction="column" align="center" w="100%" h="100%">
            <Input
                w="50%"
                alignSelf="flex-end"
                aria-label="Delete reason"
                placeholder="Delete reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                onBlur={() =>
                    invoke('cache_set', {
                        key: 'delete-reason',
                        value: reason,
                    })
                }
            />
            <Textarea
                resize="none"
                value={areaValue}
                onChange={(event) => setAreaValue(event.target.value)}
                placeholder="Write exact page names here. Separated by newline."
                flex="1"
                my={4}
            />
            <Box>
                <Button
                    isLoading={isLoading}
                    isDisabled={!isOnline || areaValue.trim() === ''}
                    onClick={deletePages}
                    loadingText="Deleting..."
                    title={!isOnline ? 'Please login first!' : 'This might take a while!'}
                >
                    Delete all
                </Button>
            </Box>
        </Flex>
    );
};

export default Delete;
