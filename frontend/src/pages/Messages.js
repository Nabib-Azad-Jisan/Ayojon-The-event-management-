import React, { useEffect, useState } from 'react';
import {
  Container, Box, Typography, List, ListItem, ListItemText, Divider, TextField, Button, Paper, Autocomplete
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get('/messages/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        // Only fetch if user is not admin
        if (user && user.role !== 'admin') {
          const res = await axios.get('/users/all');
          setAllUsers(res.data.filter(u => u._id !== user.id && u._id !== user._id));
        }
      } catch (err) {
        // fallback: try /api/users for admin
        try {
          const res = await axios.get('/users');
          setAllUsers(res.data.filter(u => u._id !== user.id && u._id !== user._id));
        } catch (err2) {
          console.error('Error fetching users:', err2);
        }
      }
    };
    fetchAllUsers();
  }, [user]);

  const fetchMessages = async (otherUserId, userObj) => {
    setSelectedUser(userObj || conversations.find(u => u._id === otherUserId));
    setLoading(true);
    try {
      const res = await axios.get(`/messages/conversation/${otherUserId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await axios.post('/messages', {
        receiver: selectedUser._id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4, display: 'flex', gap: 3 }}>
        <Paper sx={{ width: 250, minHeight: 400, p: 2 }}>
          <Typography variant="h6">Conversations</Typography>
          <Divider sx={{ my: 1 }} />
          <Autocomplete
            options={allUsers}
            getOptionLabel={option => option.name + ' (' + option.role + ')'}
            value={null}
            inputValue={searchValue}
            onInputChange={(_, newInputValue) => setSearchValue(newInputValue)}
            onChange={(_, value) => {
              if (value) fetchMessages(value._id, value);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Start new chat..." variant="outlined" size="small" sx={{ mb: 2 }} />
            )}
          />
          <List>
            {conversations.map((u) => (
              <ListItem button key={u._id} selected={selectedUser?._id === u._id} onClick={() => fetchMessages(u._id)}>
                <ListItemText primary={u.name} secondary={u.role} />
              </ListItem>
            ))}
            {conversations.length === 0 && <Typography>No conversations yet.</Typography>}
          </List>
        </Paper>
        <Paper sx={{ flex: 1, minHeight: 400, p: 2, display: 'flex', flexDirection: 'column' }}>
          {selectedUser ? (
            <>
              <Typography variant="h6">Chat with {selectedUser.name}</Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                {loading ? (
                  <Typography>Loading messages...</Typography>
                ) : (
                  messages.map((msg) => (
                    <Box key={msg._id} sx={{ mb: 1, textAlign: msg.sender === user.id || msg.sender === user._id ? 'right' : 'left' }}>
                      <Typography variant="body2" color={msg.sender === user.id || msg.sender === user._id ? 'primary' : 'secondary'}>
                        {msg.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                <Button variant="contained" onClick={handleSend}>Send</Button>
              </Box>
            </>
          ) : (
            <Typography>Select a conversation or start a new chat.</Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Messages;
