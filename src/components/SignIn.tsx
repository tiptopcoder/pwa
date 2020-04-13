import React, { useState, useCallback, ChangeEvent, FC } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  List,
  ListItemIcon,
  ListItem,
  ListItemText,
  Button,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';

interface RoomListProps {
  rooms: string[];
  onRoomSelect: (roomName: string) => void;
  roomName: string;
}

const RoomList: FC<RoomListProps> = ({ rooms, onRoomSelect, roomName }) => {
  if (!rooms || rooms.length === 0) {
    return <div></div>;
  }

  const handleRoomSelect = (roomName: string) => {
    return () => onRoomSelect(roomName);
  };

  return (
    <List>
      {rooms.map((r) => {
        return (
          <ListItem divider button key={r} selected={roomName === r} onClick={handleRoomSelect(r)}>
            <ListItemText primary={r} />
          </ListItem>
        );
      })}
    </List>
  );
};

interface SignInProps {
  onJoin: (chatName: string, roomName: string) => void;
  joinError?: string;
}

const SignIn: FC<SignInProps> = ({ onJoin, joinError }) => {
  const [rooms, setRooms] = useState<string[]>(['main']);
  const [chatName, setName] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('main');
  const [txtRoomName, setTextRoomName] = useState<string>('');
  const handleName = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value.length > 0) {
      setName(e.target.value);
    }
  }, []);
  const handleRoom = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTextRoomName(e.target.value);
  }, []);
  const onRoomSelect = useCallback((room: string) => {
    setRoomName(room);
  }, []);
  const addRoom = useCallback(
    (e) => {
      e.preventDefault();
      const value = txtRoomName.trim();
      if (value.length > 0 && rooms.indexOf(value) === -1) {
        setRoomName(value);
        setRooms([value].concat(rooms));
      }
    },
    [rooms, txtRoomName],
  );
  const join = useCallback(() => {
    onJoin(chatName, roomName);
  }, [chatName, onJoin, roomName]);
  return (
    <Box maxWidth={400} paddingX={2} marginX={'auto'} marginTop={3}>
      <Box width={'100%'}>
        {({ className }: any) => (
          <Card className={className}>
            <CardContent>
              <Typography variant={'h5'} paragraph>
                Join Room
              </Typography>
              {joinError && (
                <Box marginBottom={2}>
                  <Alert severity="error">{joinError}</Alert>
                </Box>
              )}
              <Box marginBottom={2}>
                <TextField
                  fullWidth
                  variant={'outlined'}
                  label={'Chat name'}
                  onChange={handleName}
                />
              </Box>
              <Box marginBottom={2} component={'form'} onSubmit={addRoom}>
                <TextField
                  fullWidth
                  variant={'outlined'}
                  label={'Room name'}
                  onChange={handleRoom}
                />
              </Box>
              <RoomList roomName={roomName} rooms={rooms} onRoomSelect={onRoomSelect} />
              <Box marginTop={2}>
                <Button
                  onClick={join}
                  disabled={!chatName.trim() || !roomName.trim()}
                  fullWidth
                  color={'primary'}
                  variant={'contained'}
                >
                  Join
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default SignIn;
