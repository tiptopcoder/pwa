import React, { useState, useReducer, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  makeStyles,
  Theme,
  createStyles,
  Typography,
  Button,
  Dialog,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import SignIn from './components/SignIn';
import Conversation, { Message } from './components/Conversation';
import io from 'socket.io-client';
import { red, purple, teal } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }),
);
interface AppState {
  messages?: Message[];
  chatName?: string;
  roomName?: string;
  typingMessage?: string;
  joined?: boolean;
  joinError?: string;
  users?: string[];
}

const initialState: AppState = {
  messages: [],
  chatName: '',
  roomName: '',
  typingMessage: '',
  joined: false,
  joinError: '',
  users: [],
};

const reducer = (state: AppState, newState: AppState): AppState => ({ ...state, ...newState });

const socket = io.connect(process.env.REACT_APP_SOCKET_SERVER as string);

function App() {
  const classes = useStyles();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [dialog, setDialog] = useState(false);
  const { messages, chatName, roomName, typingMessage, joined, joinError, users } = state;

  useEffect(() => {
    socket.on('user:join', (data: any) => {
      dispatch({ joined: data.success, joinError: data.error });
      setTimeout(() => {
        socket.emit('room:join', { chatName, roomName });
      }, 100);
    });
    socket.on('typing', (data: any) => {
      dispatch({ typingMessage: data.chatName === chatName ? '' : data.message });
    });
    socket.on('message', (data: any) => {
      dispatch({ messages: messages?.concat(data) });
    });
    socket.on('room:users', (data: any) => {
      dispatch({ users: data.users });
      setDialog(true);
    });
    return () => {
      socket.off('user:join');
      socket.off('typing');
      socket.off('message');
      socket.off('room:users');
    };
  }, [chatName, messages, roomName, state]);

  return (
    <Box maxHeight={'100vh'} overflow={'hidden'}>
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth={'md'}>
        <List>
          {users?.map((user) => (
            <ListItem button>
              <ListItemText primary={user} />
            </ListItem>
          ))}
        </List>
      </Dialog>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Chat It Up
          </Typography>
          {joined && (
            <Button
              color="inherit"
              onClick={() => {
                socket.emit('room:users', { roomName });
              }}
            >
              Members
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        maxHeight={{ xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' }}
        height={{ xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' }}
      >
        {!joined ? (
          <SignIn
            joinError={joinError}
            onJoin={(chatName: string, roomName: string) => {
              socket.emit('user:join', { roomName, chatName });
              dispatch({ chatName, roomName });
            }}
          />
        ) : (
          <Conversation
            messages={messages || []}
            chatName={chatName as string}
            typingMessage={typingMessage}
            onSubmit={(message: string) => {
              socket.emit('message', { roomName, chatName, message });
            }}
            onType={(typing: boolean) => {
              socket.emit(typing ? 'type:start' : 'type:stop', { roomName, chatName });
            }}
          />
        )}
      </Box>
    </Box>
  );
}

export default App;
