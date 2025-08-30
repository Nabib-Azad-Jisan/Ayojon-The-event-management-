import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Badge,
} from '@mui/material';
import { Send as SendIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

const Chat = ({ eventId, vendorId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });
    }
  }, [socket]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/messages/${eventId}/${vendorId}`);
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [eventId, vendorId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const message = {
        event: eventId,
        vendor: vendorId,
        sender: user._id,
        content: newMessage,
        timestamp: new Date(),
      };

      await axios.post('/messages', message);
      socket.emit('message', message);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Chat</Typography>
      </Box>

      <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <React.Fragment key={message._id || index}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar src={message.sender.avatar} alt={message.sender.name} />
              </ListItemAvatar>
              <ListItemText
                primary={message.sender.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {message.content}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < messages.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton color="primary" onClick={handleSendMessage}>
            <SendIcon />
          </IconButton>
          <IconButton color="primary">
            <AttachFileIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default Chat; 