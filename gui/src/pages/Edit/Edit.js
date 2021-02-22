import { Button, Flex, Grid, GridItem, Textarea, Checkbox, useToast, Input, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { promisified } from 'tauri/api/tauri';
import { Header } from '../../components';
import FindReplaceModal from './FindReplaceModal';

const Edit = ({ isOnline }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [isAuto, setIsAuto] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pageList, setPageList] = useState('');
    const [pageContent, setPageContent] = useState('');
    const [currentPage, setCurrentPage] = useState('');
    const [editSummary, setEditSummary] = useState('');
    const [patterns, setPatterns] = useState([{}]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    const startStop = () => {
        if (isRunning) {
            setPageList(state => (currentPage || '') + '\n' + (state || ''));
            setPageContent('');
        } else {
            getNextPage();
        }
        setIsRunning(state => !state);
    };

    const getNextPage = () => {
        setPageContent('');
        setIsLoading(true);
        const pages = pageList
            .trim()
            .split(/\r?\n/)
            .map(el => el.trim())
            .filter(el => el);
        const curr = pages.shift();
        setCurrentPage(curr);
        setPageList(pages.join('\n'));
        if (!curr) {
            setIsRunning(false);
            setIsLoading(false);
        } else {
            promisified({
                cmd: 'getPage',
                page: curr,
                patterns: patterns,
            })
                .then(setPageContent)
                .catch(err => {
                    startStop();
                    toast({
                        title: 'Something went wrong!',
                        description: err,
                        status: 'error',
                        duration: 10000,
                        isClosable: true,
                    });
                })
                .finally(() => setIsLoading(false));
        }
    };

    const save = () => {
        setIsLoading(true);
        promisified({
            cmd: 'edit',
            title: currentPage,
            content: pageContent
                .replace(/[\u007F-\u009F\u200B]/g, '')
                .replace(/…/g, '...')
                .trim(),
            summary: editSummary || null,
        })
            .then(res => {
                toast({
                    title: 'Edit successful',
                    description: res,
                    status: 'success',
                    duration: 1000,
                    isClosable: true,
                });
                getNextPage();
            })
            .catch(err => {
                setIsLoading(false);
                toast({
                    title: 'Something went wrong!',
                    description: err,
                    status: 'error',
                    duration: 10000,
                    isClosable: true,
                });
            });
    };

    return (
        <>
            <Flex direction="column" align="center" p="0 1rem 1rem" h="100vh">
                <Header isOnline={isOnline} isDisabled={isLoading} />
                <Grid h="100%" w="100%" templateRows="repeat(3, 1fr)" templateColumns="repeat(4, 1fr)" gap={4}>
                    <GridItem rowSpan={3} whiteSpace="nowrap">
                        <Textarea
                            isDisabled={isRunning}
                            resize="none"
                            h="100%"
                            placeholder="List of pages to operate on. Seperated by newline."
                            value={pageList}
                            onChange={event => setPageList(event.target.value)}
                        />
                    </GridItem>
                    <GridItem colSpan={3} rowSpan={2}>
                        <Textarea
                            isDisabled={isAuto || isLoading || !isRunning}
                            resize="none"
                            h="100%"
                            placeholder="Page contents will be displayed here."
                            value={pageContent}
                            onChange={event => setPageContent(event.target.value)}
                        />
                    </GridItem>
                    <GridItem colSpan={3}>
                        <Grid templateColumns="repeat(8, 1fr)" templateRows="repeat(4, 1fr)" h="100%">
                            <GridItem colSpan={4} mt={2}>
                                Current page: {isRunning ? currentPage : 'Not running!'}
                            </GridItem>
                            <GridItem rowStart={4} colSpan={2}>
                                <Button
                                    mt={2}
                                    title="This will be processed before contents get displayed!"
                                    onClick={onOpen}
                                    isDisabled={isLoading}
                                >
                                    Setup Find & Replace
                                </Button>
                            </GridItem>
                            <GridItem colSpan={3} mr={4}>
                                <Input
                                    placeholder="Edit summary"
                                    value={editSummary}
                                    onChange={event => setEditSummary(event.target.value)}
                                />
                            </GridItem>
                            <GridItem rowSpan={4} colStart={8}>
                                <Flex direction="column" align="center" justify="space-between" h="100%">
                                    <Button
                                        w="100%"
                                        onClick={startStop}
                                        isDisabled={!isOnline || isLoading}
                                        title={
                                            !isOnline
                                                ? 'Please login first!'
                                                : isRunning
                                                ? ''
                                                : 'This might take a while!'
                                        }
                                    >
                                        {isRunning ? 'Stop' : 'Start'}
                                    </Button>
                                    <Checkbox
                                        isChecked={isAuto}
                                        onChange={event => setIsAuto(event.target.checked)}
                                        isDisabled={true /* TODO */}
                                    >
                                        Auto-Save
                                    </Checkbox>
                                    <Button
                                        w="100%"
                                        isDisabled={!isRunning || !currentPage}
                                        isLoading={isLoading}
                                        onClick={getNextPage}
                                    >
                                        Skip
                                    </Button>
                                    <Button
                                        w="100%"
                                        isDisabled={!isRunning || !currentPage}
                                        isLoading={isLoading}
                                        onClick={save}
                                    >
                                        Save
                                    </Button>
                                </Flex>
                            </GridItem>
                        </Grid>
                    </GridItem>
                </Grid>
            </Flex>

            <FindReplaceModal isOpen={isOpen} onClose={onClose} patterns={patterns} setPatterns={setPatterns} />
        </>
    );
};

export default Edit;