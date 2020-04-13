import React, { FC, useState, useEffect, createRef, useCallback, ChangeEvent } from 'react';
import { red, purple, teal, grey } from '@material-ui/core/colors';
import { Box, Grid, Container, TextField, Typography } from '@material-ui/core';
import styled from 'styled-components';

export interface Message {
  message?: string;
  color?: string;
  chatName?: string;
  from?: string;
  roomName?: string;
  date?: string;
}

const ScrollableContainer = styled.div`
  overscroll-behavior-y: contain;
`;

interface MessageBubbleProps {
  data: Message;
  chatName: string;
}

const MessageBubble: FC<MessageBubbleProps> = ({ data, chatName }) => {
  return (
    <Box display={'flex'} justifyContent={data.from === chatName ? 'flex-end' : ''}>
      <Box
        borderRadius={8}
        bgcolor={data.color}
        color={'white'}
        maxWidth={{ xs: 280, sm: 350, md: 480, lg: 550 }}
        width={{ xs: 280, sm: 350, md: 480, lg: 550 }}
        padding={1}
        marginBottom={1}
      >
        <Box display={'flex'} justifyContent={'space-between'} marginBottom={2}>
          <Box>{data.from} says:</Box>
          <Box>
            <Box>room: {data.roomName}</Box>
            <Box>@: {data.date}</Box>
          </Box>
        </Box>
        <Box fontWeight={'700'}>{data.message}</Box>
      </Box>
    </Box>
  );
};

interface ConversationProps {
  messages: Message[];
  chatName: string;
  typingMessage?: string;
  onSubmit: (message: string) => void;
  onType: (typing: boolean) => void;
}

const Conversation: FC<ConversationProps> = ({
  messages,
  chatName,
  typingMessage,
  onSubmit,
  onType,
}) => {
  const scrollRef = createRef<HTMLDivElement>();
  const [message, setMessage] = useState<string>('');
  const handleMessage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setMessage(value);
      onType(!!value);
    },
    [onType],
  );
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(message);
      setMessage('');
      onType(false);
    },
    [message, onSubmit, onType],
  );
  useEffect(() => {
    if (!scrollRef || !scrollRef.current) {
      return;
    }
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, scrollRef]);
  return (
    <Box height={'100%'}>
      <Box position={'relative'} height={'100%'}>
        <Box paddingX={2} paddingTop={2} paddingBottom={10} height={'100%'} overflow={'scroll'}>
          <ScrollableContainer ref={scrollRef}>
            {messages.map((m, i) => (
              <MessageBubble key={i} chatName={chatName} data={m} />
            ))}
          </ScrollableContainer>
        </Box>
        <Box
          position={'absolute'}
          zIndex={1}
          width={'100%'}
          bottom={0}
          bgcolor={'white'}
          paddingY={1}
          paddingX={1.5}
          borderTop={'1px solid rgba(0, 0, 0, 0.1)'}
        >
          <Box component={'form'} onSubmit={handleSubmit}>
            <TextField
              variant={'filled'}
              value={message}
              label={'Type your message ...'}
              fullWidth
              onChange={handleMessage}
            />
          </Box>
          <Box color={!typingMessage ? 'transparent' : grey[500]} paddingTop={0.5}>
            {({ className }: any) => (
              <Typography className={className} variant={'body2'}>
                {typingMessage}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Conversation;
